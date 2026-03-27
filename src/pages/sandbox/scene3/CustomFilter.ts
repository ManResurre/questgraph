import { Filter, GlProgram } from "pixi.js";

export interface CustomShaderOptions {
  waveAmplitude?: number;
  waveFrequency?: number;
}

/**
 * Заготовка кастомного шейдерного фильтра
 *
 * @example
 * const customFilter = createCustomFilter({ waveAmplitude: 0.05, waveFrequency: 10.0 });
 * sprite.filters = [customFilter];
 *
 * // В анимации:
 * app.ticker.add((ticker) => {
 *   customFilter.resources.timeUniforms.uniforms.uTime += 0.1 * ticker.deltaTime;
 * });
 */
export function createCustomFilter(options: CustomShaderOptions = {}) {
  const { waveAmplitude = 0.0, waveFrequency = 1.0 } = options;

  const fragment = `
    in vec2 vTextureCoord;
    out vec4 finalColor;

    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uWaveAmplitude;
    uniform float uWaveFrequency;

    void main(void)
    {
      vec2 coord = vTextureCoord;
      vec4 color = texture(uTexture, coord);

      // Здесь будет ваша шейдерная логика
      // Примеры:
      // color.rgb *= 1.2;                    // увеличить яркость
      // color.r = min(color.r + 0.3, 1.0);   // добавить красный
      // coord.x += sin(coord.y * 10.0) * 0.05; // волна

      finalColor = color;
    }
  `;

  const vertex = `
    in vec2 aPosition;
    in vec2 aTextureCoord;

    out vec2 vTextureCoord;

    uniform vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    vec4 filterVertexPosition(void)
    {
        vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
        position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
        position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
        return vec4(position, 0.0, 1.0);
    }

    vec2 filterTextureCoord(void)
    {
        return aPosition * (uOutputFrame.zw * uInputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();
        vTextureCoord = filterTextureCoord();
    }
  `;

  return new Filter({
    glProgram: new GlProgram({
      fragment,
      vertex,
    }),
    resources: {
      timeUniforms: {
        uTime: { value: 0.0, type: "f32" },
        uWaveAmplitude: { value: waveAmplitude, type: "f32" },
        uWaveFrequency: { value: waveFrequency, type: "f32" },
      },
    },
  });
}
