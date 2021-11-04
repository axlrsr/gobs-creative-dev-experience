varying vec3 vColor;
varying float vOpacity;

void main()
{
  vec3 blackColor = vec3(0.0);
  vec3 whiteColor = vColor;
  float strength = 0.15 / (distance(vec2(gl_PointCoord.x, (gl_PointCoord.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
  strength *= 0.15 / (distance(vec2(gl_PointCoord.y, (gl_PointCoord.x - 0.5) * 5.0 + 0.5), vec2(0.5)));

  vec3 mixedColor = mix(blackColor, whiteColor, strength);

  gl_FragColor = vec4(mixedColor, vOpacity);
}