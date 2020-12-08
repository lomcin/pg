// Author: Lucas Oliveira Maggi (lom@cin.ufpe.br)

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

// Rendering Options
uniform bool useTexture;
uniform bool useLight;
uniform bool useNormal;
uniform bool useAmbient;
uniform bool useDiffuse;
uniform bool useSpecular;
uniform bool useSpecularMapping;

// Material Properties
uniform float Ka; // Ambient Constant
uniform float Kd; // Diffuse Constant
uniform float Ks; // Specular Constant
uniform float specularPower = 12; // Specular Power Constant

uniform float lightIntensity;
uniform vec3 lightDiffuse;

uniform sampler2D texture;
uniform sampler2D normalTexture;
uniform sampler2D specularTexture;

uniform mat3 normalMatrix;
uniform vec3 cameraDir = vec3(0,0,1);
uniform vec4 ambientLightColor;

varying vec4 vertColor;
varying vec4 vertTexCoord;
varying vec3 vertNormal;
varying vec3 vertLightDir;

void main() {
  vec4 color, lightColor = vec4(lightDiffuse,1.0);
  vec4 photonIntensity;
  vec3 normal = vertNormal;
  float cosTheta;
  float specularValue, iKs;
  vec4 specular, ambient, diffuse;
  vec3 reflectedSpecularDir;
  
  // Swapping normal by normal texture value
  if (useNormal) {
    normal = normalize(texture2D(normalTexture, vertTexCoord.st).rgb);
  }

  // Specular value definition for this fragment
  if (useSpecularMapping) {
    // Specular mapping calculation
    specular = texture2D(specularTexture,vertTexCoord.st);
    iKs = specular.g; // Getting Red component since all components are equal
  } else {
    // Use uniform Specular constant
    iKs = Ks;
  }
  // Light intensity and reflection calculations
  if (useLight) {
    cosTheta = max(0.0, dot(vertLightDir, normal));
    reflectedSpecularDir = reflect(-vertLightDir, normal);
    photonIntensity = vec4(vec3(cosTheta),1.0);
  }

  // Get texture color or utilize default value
  if (useTexture) {
    color = texture2D(texture, vertTexCoord.st);
  } else {
    color = vertColor;
  }

  // Utilizing default color
  gl_FragColor = color;

  if (useLight) {
    // Calculate phong components according to the "use" variables
    specularValue = iKs * pow(max(0.0, dot(reflectedSpecularDir,cameraDir)), specularPower);
    ambient = (useAmbient ? Ka * ambientLightColor * color : vec4(0.0));
    diffuse = (useDiffuse ? Kd * photonIntensity * color * lightColor : vec4(0.0));
    specular = (useSpecular ? vec4(vec3(specularValue * lightColor), specular.a) : vec4(0.0));

    // Combine phong components
    gl_FragColor =  ambient + diffuse + specular;
  }
}