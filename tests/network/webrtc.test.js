require('../../src/env/debug.js');
var expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    Webrtc = rewire('../../src/network/webrtc.js'),
    Rx = require('rx'),
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('network', function () {
    describe('webrtc', function () {
        var webrtc,
            scheduler,
            result,
            pcMock,
            dataChannelMock,
            signallerMock,
            signallerReadStreamMock,
            signallerWriteBusMock;

        beforeEach(function () {
            dataChannelMock = {
                send: function () {},
                bufferedAmount: 0,
                readyState: 'connecting'
            };
            pcMock = {
                createOffer: sinon.stub(),
                createDataChannel: sinon.stub().returns(dataChannelMock),
                setLocalDescription: sinon.stub()
            };
            signallerReadStreamMock = new Rx.ReplaySubject();
            signallerWriteBusMock = new Rx.ReplaySubject();
            signallerMock = {
                getReadStream: sinon.stub().returns(signallerReadStreamMock),
                getWriteBus: sinon.stub().returns(signallerWriteBusMock)
            };
            scheduler = new TestScheduler();
            result = scheduler.createObserver();

            // override  variables from the scope
            Webrtc.__set__('Signaller', sinon.stub().returns(signallerMock));
            Webrtc.__set__('scheduler', scheduler);
            Webrtc.__set__('RTCPeerConnection ', sinon.stub().returns(pcMock));
            Webrtc.__set__('RTCSessionDescription', sinon.stub().returns({}));
            Webrtc.__set__('RTCIceCandidate', sinon.stub().returns({}));

            // call RTCSessionDescriptionCallback
            pcMock.createOffer.callsArgWith(0, 'sample sdp');
            // call successCallback
            pcMock.setLocalDescription.callsArg(1);

        });

        describe('signaller', function () {
            it('sends sdp and icecandidates by signaller', function () {
                webrtc = new Webrtc('pin123');
                // schedule ice candidates
                scheduler.scheduleAbsolute(20, function () {
                    pcMock.onicecandidate({candidate: 1});
                });
                scheduler.scheduleAbsolute(40, function () {
                    pcMock.onicecandidate({candidate: 2});
                });
                signallerWriteBusMock.subscribe(result);

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(0, {sdp : 'sample sdp'}),
                    onNext(20, {candidate: 1}),
                    onNext(40, {candidate: 2})
                ]);
            });
            it('sends errors to signaller till dataChannel is not opened', function () {
                // call failureCallback
                pcMock.setLocalDescription.callsArgWith(2, new Error());

                webrtc = new Webrtc('pin123');

                signallerWriteBusMock.subscribe(result);

                expect(result.messages).to.deep.equal([
                    onError(0, new Error())
                ]);
            });
        });
        describe('#writeBus', function () {
            it('buffers messages received before transport open', function () {
                webrtc = new Webrtc('pin123');
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(webrtc.getWriteBus());
                webrtc.getWriteBus().subscribe(result);

                scheduler.scheduleAbsolute(200, function () {
                    dataChannelMock.onopen();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(200, 1),
                    onNext(200, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                ]);
            });
            it('buffers sequence completed before transport open', function () {
                webrtc = new Webrtc('pin123');
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(webrtc.getWriteBus());
                webrtc.getWriteBus().subscribe(result);

                scheduler.scheduleAbsolute(800, function () {
                    dataChannelMock.onopen();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(800, 1),
                    onNext(800, 2),
                    onNext(800, 3),
                    onNext(800, 4),
                    onNext(800, 5),
                    onCompleted(800)
                ]);
            });
            it('buffers sequence when bufferedAmount is not 0 ', function () {
                webrtc = new Webrtc('pin123');
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(200, 2),
                    onNext(300, 3),
                    onNext(400, 4),
                    onNext(450, 5),
                    onNext(700, 6),
                    onNext(800, 7),
                    onNext(850, 8),
                    onNext(900, 9),
                    onNext(1000, 10),
                    onNext(1200, 11),
                    onNext(1400, 12),
                    onNext(2000, 13),
                    onNext(2500, 14),
                    onNext(3000, 15),
                    onNext(3400, 16),
                    onNext(3450, 17),
                    onCompleted(5000)
                );

                testSequence.subscribe(webrtc.getWriteBus());
                webrtc.getWriteBus().subscribe(result);

                scheduler.scheduleAbsolute(50, function () {
                    dataChannelMock.onopen();
                });
                scheduler.scheduleAbsolute(350, function () {
                    dataChannelMock.bufferedAmount = 1;
                });
                scheduler.scheduleAbsolute(430, function () {
                    dataChannelMock.bufferedAmount = 2;
                });
                scheduler.scheduleAbsolute(1000, function () {
                    dataChannelMock.bufferedAmount = 0;
                });
                scheduler.scheduleAbsolute(1300, function () {
                    dataChannelMock.bufferedAmount = 1;
                });
                scheduler.scheduleAbsolute(2000, function () {
                    dataChannelMock.bufferedAmount = 0;
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(70, 1),
                    onNext(200, 2),
                    onNext(300, 3),
                    // Please, take in mind,
                    // that right now we are sending one more message,
                    // if buffer is > 0.
                    // Can be improved
                    onNext(400, 4),
                    onNext(1000, 5),
                    onNext(1000, 6),
                    onNext(1000, 7),
                    onNext(1000, 8),
                    onNext(1000, 9),
                    onNext(1000, 10),
                    onNext(1200, 11),
                    // Please, take in mind,
                    // that right now we are sending one more message,
                    // if buffer is > 0
                    // Can be improved
                    onNext(1400, 12),
                    onNext(2000, 13),
                    onNext(2500, 14),
                    onNext(3000, 15),
                    onNext(3400, 16),
                    onNext(3450, 17),
                    onCompleted(5000)
                ]);
            });
            it('throws an error on signallers read error', function () {
                webrtc = new Webrtc('pin123');
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(webrtc.getWriteBus());
                webrtc.getWriteBus().subscribe(result);

                // call RTCSessionDescriptionCallback
                pcMock.createOffer.callsArgWith(0, {sdp: 'zzz'});
                scheduler.scheduleAbsolute(200, function () {
                    signallerReadStreamMock.onError();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onError(200)
                ]);
            });
            it('errors on peerconnection error', function () {
                // call failureCallback
                pcMock.setLocalDescription.callsArgWith(2, new Error());

                webrtc = new Webrtc('pin123');
                webrtc.getWriteBus().subscribe(result);

                expect(result.messages).to.deep.equal([
                    onError(0, new Error())
                ]);
            });
            it('ignores signallers errors after data channel established', function () {
                webrtc = new Webrtc('pin123');

                webrtc.getWriteBus().subscribe(result);

                scheduler.scheduleAbsolute(200, function () {
                    dataChannelMock.onopen();
                });
                scheduler.scheduleAbsolute(300, function () {
                    signallerReadStreamMock.onError();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([]);
            });
        });
        describe('#readStream', function () {
            it('errors on peerconnection error', function () {
                // call RTCPeerConnectionErrorCallback
                pcMock.createOffer.callsArgWith(1, new Error());

                webrtc = new Webrtc('pin123');
                webrtc.getReadStream().subscribe(result);

                expect(result.messages).to.deep.equal([
                    onError(0, new Error())
                ]);
            });
            it('ignores signallers errors after data channel established', function () {
                webrtc = new Webrtc('pin123');

                webrtc.getReadStream().subscribe(result);

                scheduler.scheduleAbsolute(200, function () {
                    dataChannelMock.onopen();
                });
                scheduler.scheduleAbsolute(300, function () {
                    signallerReadStreamMock.onError();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([]);
            });
        });
    });
});
