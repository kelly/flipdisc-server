import protobuf from 'protobufjs';

const schema = {
  nested: {
    LiveScene: {
      fields: {
        id: { type: 'int32', id: 1 },
        isPlaying: { type: 'bool', id: 2 },
        timeRemaining: { type: 'int32', id: 3 },
        imageData : { type: 'bytes', id: 4 } // 'bytes' type for binary data
      }
    },
    UserInput: {
      fields: {
        point: { type: 'bytes', id: 1 },
        size: { type: 'int32', id: 2 },
        isEnd: { type: 'bool', id: 3 }
      }
    },
  }
}
const root = protobuf.Root.fromJSON(schema);

function verify(payload, typeName) {
  const type = root.lookupType(typeName);
  if (type) {
    return !type.verify(payload);
  }
}

function create(payload, typeName) {
  const type = root.lookupType(typeName);
  if (type) {
    return type.create(payload);
  }
}

function encode(message, typeName) {
  const type = root.lookupType(typeName);
  if (type) {
    return type.encode(message).finish();
  }
}

function decode(message, typeName) {
  const type = root.lookupType(typeName);
  if (type) {
    return type.decode(message);
  }
}

function prepare(payload, typeName) {
  if (verify(payload, typeName)) {
    const msg = create(payload, typeName)
    return encode(msg, typeName)
  }
}

export {
  prepare,
  verify,
  encode,
  decode,
  create
}