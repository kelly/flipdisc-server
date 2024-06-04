import protobuf from 'protobufjs';
import { compressImageData, decompressImageData } from '../utils/index.js';

const schema = {
  nested: {
    LiveScene: {
      fields: {
        id: { type: 'int32', id: 1 },
        isPlaying: { type: 'bool', id: 2 },
        timeRemaining: { type: 'int32', id: 3 },
        imageData: { type: 'string', id: 4 } // 'bytes' type for binary data
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
};

class Message {
  constructor(schema, typeName) {
    this.root = protobuf.Root.fromJSON(schema);
    this.type = this.root.lookupType(typeName);
    if (!this.type) {
      throw new Error(`Type ${typeName} not found in schema.`);
    }
  }

  verify(payload) {
    const error = this.type.verify(payload);
    if (error) throw new Error(error);
    return true;
  }

  create(payload) {
    this.verify(payload); // Ensure the payload is valid before creating.
    return this.type.create(payload);
  }

  encode(message) {
    return this.type.encode(message).finish();
  }

  decode(buffer) {
    return this.type.decode(buffer);
  }

  prepare(payload) {
    const message = this.create(payload); // create already verifies the payload
    return this.encode(message);
  }

}

class LiveSceneMessage extends Message {
  constructor() {
    super(schema, 'LiveScene');
  }

  encode(imageData, info) { 
    const { id, isPlaying, timeRemaining } = info;
    imageData = compressImageData(imageData)
    const payload = { 
      id, 
      isPlaying, 
      timeRemaining, 
      imageData };
    const message = this.create(payload);
    return super.encode(message);
  }

  decode(message) {
    const buffer = new Uint8Array(message);      
    const data = super.decode(buffer);
    data.imageData = decompressImageData(data.imageData);
    return data;
  }
}

class UserInputMessage extends Message {
  constructor() {
    super(schema, 'UserInput');
  }

  decode(message) {
    const buffer = new Uint8Array(message);      
    return super.decode(buffer);
  }
}

export { Message, LiveSceneMessage, UserInputMessage, schema }