import { Filter, GlProgram } from "pixi.js";

export interface PlanetShaderOptions {
  /**
   * Положение источника света [x, y]
   * Диапазон: от -1.0 до 1.0
   * [0.5, 0.3] — свет справа-сверху (по умолчанию)
   * [0.0, 0.0] — свет по центру
   * [-0.5, -0.3] — свет слева-снизу
   */
  lightPos?: [number, number];

  /**
   * Размеры спрайта [width, height]
   * Нужно передавать те же значения, что и в width/height спрайта
   */
  spriteSize?: [number, number];
}

/**
 * Шейдер планеты с эффектом сферы и освещением
 *
 * @example
 * // Базовое использование:
 * const planetFilter = createPlanetFilter({ lightPos: [0.5, 0.3], spriteSize: [300, 300] });
 * sprite.filters = [planetFilter];
 *
 * // В анимации (вращение):
 * filter.resources.planetUniforms.uniforms.uTime += 0.01;
 *
 * @param options.lightPos - Положение света [x, y] от -1 до 1
 * @param options.spriteSize - Размеры спрайта [width, height]
 *
 * @uniforms
 * uTime - время для вращения (0.1 = скорость вращения)
 * uLightPos - направление на источник света
 * uSpriteSize - размеры спрайта для коррекции пропорций
 */
export function createPlanetFilter(options: PlanetShaderOptions = {}) {
  const { lightPos = [0.5, 0.3], spriteSize = [300, 300] } = options;

  // =====================================================
  // FRAGMENT SHADER
  // =====================================================
  const fragment = `
    varying vec2 vTextureCoord;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uLightPos;
    uniform vec2 uSpriteSize;

    out vec4 finalColor;

    void main(void) {
      // ============================================
      // 1. КООРДИНАТЫ И МАСКА КРУГА
      // ============================================

      // Нормализуем координаты: из 0..1 в -1..1
      vec2 p = (vTextureCoord - 0.5) * 2.0;

      // Учитываем соотношение сторон спрайта (для квадрата не нужно)
      p.x *= uSpriteSize.y / uSpriteSize.x;

      // Вычисляем расстояние от центра
      float r = length(p);

      // Отбрасываем пиксели за пределами круга (маска планеты)
      if (r > 1.0) {
        discard;
      }

      // ============================================
      // 2. СФЕРИЧЕСКОЕ ИСКАЖЕНИЕ (ЭФФЕКТ ОБЪЁМА)
      // ============================================

      // Для equirectangular проекции используем сферические координаты
      // p.x — это долгота (-1..1), p.y — широта (-1..1)

      // Ограничиваем uTime чтобы избежать потери точности float
      float time = mod(uTime, 62.8318);  // 2π * 10

      // Преобразуем в углы
      float lon = p.x * 3.14159*0.5;  // долгота: -π до π
      float lat = p.y * 2.0;   // широта: -π/2 до π/2

      // Добавляем вращение по долготе (одинаковое для всех широт)
      lon += time * 0.1;

      // Преобразуем обратно в UV координаты текстуры
      vec2 uv;
      uv.x = lon / 6.28318 + 0.5;  // 2π
      uv.y = lat / 3.14159 + 0.5;  // π

      // Зацикливаем UV (wrap mode)
      uv.x = fract(uv.x);

      // Сэмплируем текстуру
      vec4 color = texture(uTexture, uv);

      // ============================================
      // 4. ОСВЕЩЕНИЕ (ФАЗА ПЛАНЕТЫ)
      // ============================================

      // Вычисляем нормаль поверхности сферы
      // Z-компонента — это "высота" точки на сфере
      vec3 normal = vec3(p, sqrt(max(0.0, 1.0 - r * r)));

      // Направление на источник света (из uniform)
      vec3 lightDir = normalize(vec3(uLightPos, 1.0));

      // Скалярное произведение = угол между нормалью и светом
      float light = dot(normal, lightDir);

      // Ограничиваем освещённость: 0.05 — мин. подсветка "ночной" стороны
      // 1.0 — максимум (дневная сторона)
      light = clamp(light, 0.05, 1.0);

      // Применяем освещение к цвету
      finalColor = vec4(color.rgb * light, 1.0);
    }
  `;

  // =====================================================
  // VERTEX SHADER
  // =====================================================
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
      planetUniforms: {
        uTime: { value: 0.0, type: "f32" },
        uLightPos: { value: lightPos, type: "vec2<f32>" },
        uSpriteSize: { value: spriteSize, type: "vec2<f32>" },
      },
    },
  });
}
