var expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    Webrtc = rewire('../../src/network/webrtc.js'),
    Rx = require('rx'),
    // Shortcuts
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('network', function () {
    describe('webrtc', function () {
        var webrtc,
            signallerMock,
            pcMock;

        Webrtc.__set__('Signaller', function () {
            return signallerMock;
        });

        Webrtc.__set__('RTCSessionDescription', function () {
            return {};
        });
        Webrtc.__set__('RTCIceCandidate', function () {
            return {};
        });
        Webrtc.__set__('RTCPeerConnection ', function () {
            return pcMock;
        });
        beforeEach(function (){
            pcMock = {
                readyState: 'connecting',
                createOffer: sinon.stub()
            };
            signallerMock = {
                getReadStream: sinon.stub().returns(new Rx.Subject()),
                getWriteBus: sinon.stub().returns(new Rx.Subject())
            };
            webrtc = new Webrtc('pin123');
        });


        it('should buffer messages coming to writeBus', function () {
        });
    });
});
