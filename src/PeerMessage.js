var jDataView = require('jdataview'),

    VERSION_1 = 1,

    AB_DATA_TYPE = 1,
    STRING_DATA_TYPE = 2,
    OBJECT_DATA_TYPE = 4;

exports.CONTROL_PLANE = 1;
exports.DATA_PLANE =  1 << 1;
exports.encode = function (plane, payload) {
    var classType = Object.prototype.toString.call(payload),
        dataType, dataView;

    switch (classType) {
        case '[object ArrayBuffer]':
            dataType = AB_DATA_TYPE;
            break;
        case  '[object String]':
            dataType = STRING_DATA_TYPE;
            break;
        case  '[object Object]':
            dataType = OBJECT_DATA_TYPE;
            payload = JSON.stringify(payload);
            break;
    }

    dataView = new jDataView(3 + (payload.length || payload.byteLength));
    dataView.writeInt8(VERSION_1);
    dataView.writeInt8(plane);
    dataView.writeInt8(dataType);
    if (dataType === AB_DATA_TYPE) {
        dataView.writeBytes(new Int8Array(payload));
    } else {
        dataView.writeString(payload);
    }

    return dataView.getBytes(dataView.byteLength, 0);
};

exports.decode = function (buffer) {
    var dataView = new jDataView(buffer),
        version = dataView.getInt8(),
        plane = dataView.getInt8(),
        dataType = dataView.getInt8(),
        payload;

    if (version !== VERSION_1) {
        throw 'version not supported';
    }

    if (dataType === AB_DATA_TYPE) {
        payload = dataView.getBytes();
    } else if (dataType === STRING_DATA_TYPE) {
        payload = dataView.getString();
    } else if (dataType === OBJECT_DATA_TYPE) {
        payload = JSON.parse(dataView.getString());
    }

    return {
        plane: plane,
        payload: payload
    };
};

console.log(this.decode(this.encode(this.CONTROL_PLANE, new ArrayBuffer(4))));
