var expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    FileReceiver = rewire('../../src/file/file-receiver.js'),
    Rx = require('rx'),
    // Shortcuts
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted;

describe('file', function () {
    describe('file-receiver', function () {
    });
});
