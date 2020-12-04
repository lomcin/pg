#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

// Rendering Options
uniform bool useTexture;
uniform bool useLight;
uniform bool useNormal;
uniform bool useAmbient;
uniform bool useDifuse;
uniform bool useSpecular;

// Material Properties
uniform float Ka; // Ambient Constant
uniform float Kd; // Difuse Constant
uniform float Ks; // Specular Constant
uniform float specularPower = 12; // Specular Power Constant

uniform float lightIntensity;
uniform vec4 lightColor = vec4(1);

uniform sampler2D texture;
uniform sampler2D normalTexture;

uniform mat3 normalMatrix;
uniform vec3 cameraDir = vec3(0,0,1);

varying vec4 vertColor;
varying vec4 vertTexCoord;
varying vec3 vertNormal;
varying vec3 vertLightDir;

void main() {
  vec4 color;
  vec4 photonIntensity;
  vec3 normal = vertNormal;
  float cosTheta;
  float specularValue;
  vec4 specular, ambient, difuse;
  vec3 reflectedSpecularDir;
  // if (int(vertTexCoord.s*200)%2 == 0 || int(vertColor.t*200)%2 == 0) {
  //   gl_FragColor = vec4(0);
  //   return;
  // }
  if (useNormal) {
    normal = normalize(texture2D(normalTexture, vertTexCoord.st).rgb);
    // normal = normalize(normalMatrix * normal);
  }
  if (useLight) {
    cosTheta = max(0.0, dot(vertLightDir, normal));
    reflectedSpecularDir = reflect(-vertLightDir, normal);
    photonIntensity = vec4(vec3(cosTheta),1.0);
  }
  if (useTexture) {
    color = texture2D(texture, vertTexCoord.st);
  } else {
    color = vertColor;
  }
  gl_FragColor = color;
  if (useLight) {
    specularValue = pow(max(0.0, dot(reflectedSpecularDir,cameraDir)), specularPower);
    ambient = (useAmbient ? vec4(vec3(Ka * lightColor * color), difuse.a) : vec4(0.0));
    difuse = (useDifuse ? Kd * photonIntensity * color : vec4(0.0));
    specular = (useSpecular ? vec4(vec3(Ks * specularValue * lightColor), difuse.a) : vec4(0.0));
    gl_FragColor =  ambient + difuse + specular;
  }
}