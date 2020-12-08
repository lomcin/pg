// Author: Lucas Oliveira Maggi (lom@cin.ufpe.br)

uniform mat4 transform;
uniform mat3 normalMatrix;
uniform mat4 texMatrix;
uniform vec3 lightNormal;

attribute vec4 position;
attribute vec4 color;
attribute vec3 normal;
attribute vec2 texCoord;

varying vec4 vertColor;
varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertTexCoord;

void main() {
  gl_Position = transform * position;
  vertColor = color;
  vertNormal = normalize(normalMatrix * normal);
  vertLightDir = -lightNormal;
  vertTexCoord = texMatrix * vec4(texCoord, 1.0, 1.0);
  // if (useNormal) {
  //   vertNormal = normalMatrix * vec4(texCoord, 1.0, 1.0);
  // }
}
