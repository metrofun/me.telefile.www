var expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    Rx = require('rx'),
    Frame = require('../../src/network/frame.js'),
    Signaller = rewire('../../src/network/signaller.js'),
    // Shortcuts
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('network', function () {
    describe('signaller', function () {
        var scheduler, result, signaller,
            sockMock = sinon.mock({
                send: function () {},
                onopen: function () {},
                onerror: function () {},
                readyState: 'open'
            });

        Signaller.__set__('SockJS', function () {
            return sockMock;
        });

        beforeEach(function (){
            signaller = new Signaller('123456');
            scheduler = new TestScheduler();
            result = scheduler.createObserver();
        });

        it('should not return message with a pin', function () {
            signaller.getReadStream().subscribe(result);

            var testSequence = scheduler.createHotObservable(
                onNext(70, {pin: '1223'}),
                onNext(270, {z: 1}),
                onNext(340, {a: 2}),
                onCompleted(600)
            );


            testSequence.subscribe(function (value) {
                sockMock.onmessage({
                    data: Frame.encode(1, value)
                });
            });
            scheduler.start();

            expect(result.messages).to.deep.equal([
                onNext(270, {z: 1}),
                onNext(340, {a: 2})
            ]);
        });

        it('getPin should reject on error', function (done) {
            sockMock.onclose();

            signaller.getPin().catch(function () {
                done();
            });
        });
    });
});
