require('../../src/libs/debug.js');
var expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    Webrtc = rewire('../../src/network/webrtc.js'),
    Rx = require('rx'),
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    // onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('network', function () {
    describe('webrtc', function () {
        var webrtc,
            scheduler,
            result,
            dataChannelMock,
            pcMock = {
                createOffer: sinon.stub(),
                createDataChannel: sinon.stub()
            },
            signallerMock = {
                getReadStream: sinon.stub().returns(new Rx.Subject()),
                getWriteBus: sinon.stub().returns(new Rx.Subject())
            };

        Webrtc.__set__('Signaller', sinon.stub().returns(signallerMock));
        Webrtc.__set__('RTCPeerConnection ', sinon.stub().returns(pcMock));
        Webrtc.__set__('RTCSessionDescription', sinon.stub().returns({}));
        Webrtc.__set__('RTCIceCandidate', sinon.stub().returns({}));

        beforeEach(function (){
            scheduler = new TestScheduler();
            result = scheduler.createObserver();
            dataChannelMock = {
                send: function () {},
                bufferedAmount: 0,
                readyState: 'connecting'
            };
            pcMock.createDataChannel.returns(dataChannelMock);
            webrtc = new Webrtc('pin123');
        });


        describe('#writeBus', function () {
            // it('should buffer messages coming to writeBus', function (done) {
                // var testSequence = new Rx.Subject();

                // testSequence.onNext(1);
                // testSequence.onNext(5);
                // testSequence.onNext(9);
                // testSequence.onCompleted();

                // testSequence.subscribe(webrtc.getWriteBus());
                // webrtc.getWriteBus().zip(testSequence, assert.equal).subscribe(function () {}, done, done);

                // setTimeout(function () {
                    // dataChannelMock.onopen();
                // }, 100);
            // });
            it('buffers messages received before transport open', function () {
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
        });
    });
});
