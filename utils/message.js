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

function compressImageData(matrix) {
  const encoded = [];
  for (const row of matrix) {
    let count = 1;
    for (let i = 1; i < row.length; i++) {
      if (row[i] === row[i - 1]) {
        count++;
      } else {
        encoded.push([row[i - 1], count]);
        count = 1;
      }
    }
    encoded.push([row[row.length - 1], count]);
  }
  return encoded;
}

function decodeImageData(encoded, rowLength) {
  const frames = [];
  let currentFrame = [];
  let currentRow = [];
  
  for (const [value, count] of encoded) {
    if (value === -1 && count === -1) {
      if (currentRow.length > 0) {
        currentFrame.push(currentRow);
        currentRow = [];
      }
      frames.push(currentFrame);
      currentFrame = [];
    } else {
      for (let i = 0; i < count; i++) {
        currentRow.push(value);
        if (currentRow.length === rowLength) {
          currentFrame.push(currentRow);
          currentRow = [];
        }
      }
    }
  }
  
  if (currentRow.length > 0) {
    currentFrame.push(currentRow);
  }
  if (currentFrame.length > 0) {
    frames.push(currentFrame);
  }
  
  return frames;
}


export {
  prepare,
  verify,
  encode,
  decode,
  create
}