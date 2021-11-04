uniform float uSize;
uniform float uTime;

attribute float aScale;

varying vec3 vColor;
varying float vOpacity;

void main()
{
  /**
   * Position
   */
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  modelPosition.x -= (uTime * 1.0) * (1.0 - aScale);
  modelPosition.y -= (uTime * 1.0) * (1.0 - aScale);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  /**
   * Size
   */
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / - viewPosition.z);

  /**
   * Varying
   */
  vColor = color;
  vOpacity = 1.0 - uTime * 1.5;
}