var expect = require('chai').expect,
    Frame = require('../../src/network/frame.js');

describe('network', function () {
    describe('reactive-transport-frame', function () {
        it('should correctly encode objects', function () {
            var testObject = {
                prop: '123'
            };
            expect(Frame.decode(
                Frame.encode(2, testObject)
            ).payload).to.deep.equal(testObject);
        });
    });
});
