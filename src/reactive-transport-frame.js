var jDataView = require('jdataview'),

    VERSION_1 = 1,

    ARRAY_BUFFER_TYPE = 1,
    STRING_TYPE = 2,
    OBJECT_TYPE = 4;

exports.encode = function (data) {
    var plane = data.plane,
        payload = data.payload,
        classType = Object.prototype.toString.call(payload),
        dataType, dataView;

    switch (classType) {
        case '[object ArrayBuffer]':
            dataType = ARRAY_BUFFER_TYPE;
            break;
        case  '[object String]':
            dataType = STRING_TYPE;
            break;
        case  '[object Object]':
            dataType = OBJECT_TYPE;
            payload = JSON.stringify(payload);
            break;
    }

    dataView = new jDataView(3 + (payload.length || payload.byteLength));
    dataView.writeInt8(VERSION_1);
    dataView.writeInt8(plane);
    dataView.writeInt8(dataType);
    if (dataType === ARRAY_BUFFER_TYPE) {
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

    if (dataType === ARRAY_BUFFER_TYPE) {
        payload = dataView.getBytes();
    } else if (dataType === STRING_TYPE) {
        payload = dataView.getString();
    } else if (dataType === OBJECT_TYPE) {
        payload = JSON.parse(dataView.getString());
    }

    return {
        plane: plane,
        payload: payload
    };
};
