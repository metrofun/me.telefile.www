var expect = require('chai').expect,
    sinon = require('sinon'),
    Frame = require('../../src/network/frame.js'),
    rewire = require('rewire'),
    ReactiveTransport = rewire('../../src/network/reactive-transport.js'),
    Rx = require('rx'),
    // Shortcuts
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('network', function () {
    describe('reactive-transport', function () {
        var mockTransport, scheduler, result, reactiveTransport, clock;

        beforeEach(function (){
            mockTransport = {
                close: function () {},
                send: function () {},
                onopen: function () {},
                onerror: function () {},
                readyState: 'connecting'
            };
            clock = sinon.useFakeTimers();
            ReactiveTransport.__set__('setTimeout', setTimeout);

            reactiveTransport = new ReactiveTransport(mockTransport);
            scheduler = new TestScheduler();
            result = scheduler.createObserver();
            sinon.spy(mockTransport, 'close');
            sinon.spy(mockTransport, 'send');
        });
        afterEach(function () {
            mockTransport.close.restore();
            mockTransport.send.restore();
            clock.restore();
        });

        describe('getWriteBus', function () {
            it('passes messages received after transport open', function () {
                var writeBus = reactiveTransport.getWriteBus();
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(270, 4),
                    onNext(340, 5)
                );

                testSequence.subscribe(writeBus);
                writeBus.subscribe(result);
                scheduler.scheduleAbsolute(50, function () {
                    mockTransport.onopen();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(70, 1),
                    onNext(110, 2),
                    onNext(270, 4),
                    onNext(340, 5)
                ]);
            });
            it('buffers messages received before transport open', function () {
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
            it('should buffer completed sequence before opening', function () {
                var writeBus = reactiveTransport.getWriteBus();
                var testSequence = scheduler.createHotObservable(
                    onNext(70, 1),
                    onNext(220, 3),
                    onNext(340, 5),
                    onCompleted(600)
                );

                testSequence.subscribe(writeBus);
                writeBus.subscribe(result);
                scheduler.scheduleAbsolute(1800, function () {
                    mockTransport.onopen();
                });

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(1800, 1),
                    onNext(1800, 3),
                    onNext(1800, 5),
                    onCompleted(1800)
                ]);
            });
            it('throws an error if transport errored', function () {
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
                    mockTransport.onerror(new Error());
                });

                scheduler.start();

                // TODO should be only error
                expect(result.messages).to.deep.equal([
                    onError(200, new Error())
                ]);
            });
            it('throws an error if transport closed after succesfull open', function () {
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
                    mockTransport.onerror(new Error());
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



                scheduler.scheduleAbsolute(20, function () {
                    mockTransport.onopen();
                });
                testSequence.subscribe(function (value) {
                    mockTransport.onmessage({
                        data: Frame.encode(1, value)
                    });
                }, function () {
                    mockTransport.onmessage({
                        data: Frame.encode(2, 'ERROR_TERMINATION')
                    });
                }, function () {
                    mockTransport.onmessage({
                        data: Frame.encode(2, 'NORMAL_TERMINATION')
                    });
                });
                readStream.subscribe(result);

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(70, {a: 1}),
                    onNext(270, {z: 1}),
                    onNext(340, {a: 2}),
                    onCompleted(600)
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
                    mockTransport.onclose(new Error());
                });

                readStream.subscribe(result);

                scheduler.start();

                expect(result.messages).to.deep.equal([
                    onNext(100, 'zzz'),
                    onError(200, new Error())
                ]);
            });
            it('should not close transport immidiatly after readStream completed', function () {
                var readStream = reactiveTransport.getReadStream();

                scheduler.scheduleAbsolute(0, function () {
                    readStream.onCompleted();
                });

                scheduler.scheduleAbsolute(100, function () {
                    readStream.onCompleted();
                    expect(mockTransport.close.called).to.be.false;
                });

                scheduler.start();
            });
            it('after writebus completed should be closed by a remote peer', function () {
                // open transport
                mockTransport.onopen();
                // complete write stream
                reactiveTransport.getWriteBus().onCompleted();
                // should send NORMAL_TERMINATION
                expect(mockTransport.send.called).to.be.true;
                // receive NORMAL_TERMINATION from remote peer
                mockTransport.onmessage({
                    data: Frame.encode(2, 'NORMAL_TERMINATION')
                });
                // wait for next event loop
                clock.tick(10);
                // 'close' should be called
                expect(mockTransport.close.called).to.be.true;
            });
            it('closes stream after writebus completed, if remote did not close within second', function () {
                // open transport
                mockTransport.onopen();
                // complete write stream
                reactiveTransport.getWriteBus().onCompleted();
                // wait for next event loop
                clock.tick(10);
                // 'close' should be not called
                expect(mockTransport.close.called).to.be.false;
                // wait for a second
                clock.tick(1000);
                // 'close' should be called
                expect(mockTransport.close.called).to.be.true;
            });
        });
    });
});
