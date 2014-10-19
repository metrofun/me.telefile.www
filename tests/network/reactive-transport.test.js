var expect = require('chai').expect,
    Frame = require('../../src/network/frame.js'),
    ReactiveTransport = require('../../src/network/reactive-transport.js'),
    Rx = require('rx'),
    // Shortcuts
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('network', function () {
    describe('reactive-transport', function () {
        var mockTransport, scheduler, result, reactiveTransport;

        beforeEach(function (){
            mockTransport = {
                send: function () {},
                onopen: function () {},
                onerror: function () {},
                readyState: 'connecting'
            };
            reactiveTransport = new ReactiveTransport(mockTransport);
            scheduler = new TestScheduler();
            result = scheduler.createObserver();
        });

        describe('getWriteBus', function () {
            it('should buffer messaged before opening', function () {
                var writeBus = reactiveTransport.getWriteBus();
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(writeBus);
                writeBus.subscribe(result);
                scheduler.scheduleAbsolute(200, function () {
                    mockTransport.onopen();
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
            it('should throw error on errored before open', function () {
                var writeBus = reactiveTransport.getWriteBus();
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(writeBus);
                writeBus.subscribe(result);
                scheduler.scheduleAbsolute(200, function () {
                    mockTransport.onerror();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(200, 1),
                    onNext(200, 2),
                    onError(200, new Error())
                ]);
            });
            it('should throw error if transport closed after succesfull open', function () {
                var writeBus = reactiveTransport.getWriteBus();
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(writeBus);
                writeBus.subscribe(result);
                scheduler.scheduleAbsolute(200, function () {
                    mockTransport.onopen();
                });
                scheduler.scheduleAbsolute(300, function () {
                    mockTransport.onerror();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(200, 1),
                    onNext(200, 2),
                    onNext(220, 3),
                    onNext(270, 4),
                    onError(300, new Error())
                ]);
            });
        });
        describe('getReadStream', function () {
            it('should return all messages', function () {
                var readStream = reactiveTransport.getReadStream();
                var testSequence = scheduler.createHotObservable(
                    onNext(70, {a: 1}),
                    onNext(270, {z: 1}),
                    onNext(340, {a: 2}),
                    onCompleted(600)
                );


                testSequence.subscribe(function (value) {
                    mockTransport.onmessage({
                        data: Frame.encode(1, value)
                    });
                });
                readStream.subscribe(result);

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(70, {a: 1}),
                    onNext(270, {z: 1}),
                    onNext(340, {a: 2})
                ]);
            });
            it('should error on unexpected close', function () {
                var readStream = reactiveTransport.getReadStream();

                scheduler.scheduleAbsolute(100, function () {
                    mockTransport.onmessage({
                        data: Frame.encode(1, 'zzz')
                    });
                });
                scheduler.scheduleAbsolute(200, function () {
                    mockTransport.onclose();
                });

                readStream.subscribe(result);

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(100, 'zzz'),
                    onError(200, new Error())
                ]);
            });
        });
    });
});
