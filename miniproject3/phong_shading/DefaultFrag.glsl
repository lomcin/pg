// Author: Lucas Oliveira Maggi (lom@cin.ufpe.br)

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

// Rendering Options
uniform bool useTexture;
uniform bool useLight;
uniform bool useNormal;
uniform bool difuse;
uniform bool specular;

// Material Properties
uniform float Ka; // Ambient Constant
uniform float Kd; // Difuse Constant
uniform float Ks; // Specular Constant

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
  color = texture2D(texture, vertTexCoord.st);
  gl_FragColor = color;
}