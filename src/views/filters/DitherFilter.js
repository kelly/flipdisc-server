import { Filter } from '@pixi/node'
 
const vertexShader = `
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat3 projectionMatrix;

  varying vec2 vTextureCoord;

  void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;

const fragmentShader = `
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  const vec2 resolution = vec2(84.0, 42.0);

  float getBayerValue(int x, int y) {
    if (y == 0) {
      if (x == 0) return -0.5;
      if (x == 1) return 0.0;
      if (x == 2) return -0.375;
      if (x == 3) return 0.125;
    } else if (y == 1) {
      if (x == 0) return 0.25;
      if (x == 1) return -0.25;
      if (x == 2) return 0.375;
      if (x == 3) return -0.125;
    } else if (y == 2) {
      if (x == 0) return -0.3125;
      if (x == 1) return 0.1875;
      if (x == 2) return -0.4375;
      if (x == 3) return 0.0625;
    } else if (y == 3) {
      if (x == 0) return 0.4375;
      if (x == 1) return -0.0625;
      if (x == 2) return 0.3125;
      if (x == 3) return -0.1875;
    }
    return 0.0;
  }

  float getGrayscale(vec2 coords) {
    vec2 uv = coords / resolution;
    vec3 sourcePixel = texture2D(uSampler, uv).rgb;
    return dot(sourcePixel, vec3(0.2126, 0.7152, 0.0722));
  }

  void main(void) {
    vec2 fragCoord = vTextureCoord * resolution;

    int x = int(mod(fragCoord.x, 4.0));
    int y = int(mod(fragCoord.y, 4.0));

    float grayscale = getGrayscale(fragCoord);
    float bayerValue = getBayerValue(x, y);
    float ditheredValue = grayscale + bayerValue;

    if (ditheredValue < 0.5) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  }
`;

const DitherFilter = () => {
  return new Filter(vertexShader, fragmentShader);
}

export default DitherFilter;