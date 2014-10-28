require('../../src/libs/debug.js');
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
                setLocalDescription: sinon.stub().returns(dataChannelMock)
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
