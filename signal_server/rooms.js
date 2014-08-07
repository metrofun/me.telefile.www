var HASHNAME_LENGTH = 6,
    rooms = Object.create(null),
    hashAlphabet = buildHashAlphabet();

function buildHashAlphabet() {
    return [
        // {charCode: 97, length: 26},
        // {charCode: 65, length: 26},
        {charCode: 48, length: 10}
    ].reduce(function (memo, meta) {
        memo = memo.concat(Array.apply(null, {length: meta.length}).map(function (undef, idx) {
            return String.fromCharCode(meta.charCode + idx);
        }));
        return memo;
    }, []);
}
function generateHash() {
    return Array.apply(null, {length: HASHNAME_LENGTH}).map(function () {
        return hashAlphabet[Math.floor(Math.random() * hashAlphabet.length)];
    }).join('');
}

module.exports = {
    join: function (stream, roomHash) {
        var room = rooms[roomHash];

        if (room && !room.receiver) {
            room.receiver = stream;

            room.receiver.pipe(room.transmitter);
            room.transmitter.pipe(room.receiver);
        } else {
            console.log('close');
            stream.close(404);
        }
    },
    create: function (stream) {
        var roomHash;

        if (stream) {
            //find non occupied roomHash
            do {
                roomHash = generateHash();
            } while (rooms[roomHash]);

            rooms[roomHash] = {
                transmitter: stream,
                created: Date.now()
            };

            return roomHash;
        }
    }
};
