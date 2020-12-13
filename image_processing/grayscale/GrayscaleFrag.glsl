// Author: Lucas Oliveira Maggi (lom@cin.ufpe.br)

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D texture;

varying vec4 vertColor;
varying vec4 vertTexCoord;

void main() {
  vec3 rgbColor = texture2D(texture, vertTexCoord.st).rgb;
  float gray = rgbColor.x*0.2126 + rgbColor.y*0.7152 + rgbColor.z*0.0722;
  gl_FragColor = vec4(gray, gray, gray, 1.0);
}