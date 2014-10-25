require('../../src/libs/debug.js');
var expect = require('chai').expect,
    assert = require('chai').assert,
    sinon = require('sinon'),
    rewire = require('rewire'),
    Webrtc = rewire('../../src/network/webrtc.js'),
    Rx = require('rx');

describe('network', function () {
    describe('webrtc', function () {
        var webrtc,
            dataChannelMock = {
                send: function () {},
                bufferedAmount: 0,
                readyState: 'connecting'
            },
            pcMock = {
                createOffer: sinon.stub(),
                createDataChannel: sinon.stub().returns(dataChannelMock)
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
            webrtc = new Webrtc('pin123');
        });


        it('should buffer messages coming to writeBus', function (done) {
            var testSequence = new Rx.Subject();

            testSequence.onNext(1);
            testSequence.onNext(5);
            testSequence.onNext(9);
            testSequence.onCompleted();

            testSequence.subscribe(webrtc.getWriteBus());
            webrtc.getWriteBus().log('getWriteBus');
            webrtc.getWriteBus().zip(testSequence, assert.equal).subscribe(function () {}, done, done);

            setTimeout(function () {
                dataChannelMock.onopen();
            }, 100);
        });
    });
});
