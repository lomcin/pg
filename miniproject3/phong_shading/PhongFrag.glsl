#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform bool useTexture;
uniform bool useLight;
uniform bool useNormal;
uniform bool difuse;
uniform bool specular;
uniform float Kd;
uniform float Ks;
uniform float lightIntensity;
uniform sampler2D texture;
uniform sampler2D normalTexture;

varying vec4 vertColor;
varying vec4 vertTexCoord;
varying vec3 vertNormal;
varying vec3 vertLightDir;

void main() {
  vec4 color;
  vec4 photonIntensity;
  vec3 normal = vertNormal;
  float cosTheta;
  if (useNormal) {
    normal = texture2D(normalTexture, vertTexCoord.st).xyz;
  }
  if (useLight) {
    cosTheta = max(0.0, dot(vertLightDir, normal));
    photonIntensity = vec4(vec3(cosTheta),1.0);
  }
  if (useTexture) {
    color = texture2D(texture, vertTexCoord.st);
  } else {
    color = vertColor;
  }
  gl_FragColor = color;
  if (useLight) {
    gl_FragColor = photonIntensity * Kd * color;
  }
}