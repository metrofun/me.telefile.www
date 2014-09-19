var jDataView = require('jdataview'),

    VERSION_1 = 1;

exports.encode = function (plane, payload) {
    var classType = Object.prototype.toString.call(payload),
        dataView;

    if (classType ===  '[object ArrayBuffer]') {
        dataView = new jDataView(2 + payload.byteLength);
        dataView.writeInt8(VERSION_1);
        dataView.writeInt8(plane);
        dataView.writeBytes(new Int8Array(payload));

        return dataView.getBytes(dataView.byteLength, 0);
    } else {
        return JSON.stringify({
            version: VERSION_1,
            plane: plane,
            payload: payload
        });
    }
};

exports.decode = function (data) {
    var classType = Object.prototype.toString.call(data),
        dataView, version, plane, payload;

    if (classType ===  '[object ArrayBuffer]') {
        dataView = new jDataView(data);
        version = dataView.getInt8();
        plane = dataView.getInt8();
        payload = dataView.getBytes();
    } else {
        data = JSON.parse(data);
        version = data.version;
        plane = data.plane;
        payload = data.payload;
    }

    if (version !== VERSION_1) {
        throw 'version not supported';
    }

    return {
        plane: plane,
        payload: payload
    };
};
