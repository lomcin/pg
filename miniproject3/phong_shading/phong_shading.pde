// Author: Lucas Oliveira Maggi (lom@cin.ufpe.br)

PShader defaultShader, phong;
PImage[] diffuseTex = new PImage[2];
PImage[] normalTex = new PImage[2];
PImage[] specularTex = new PImage[2];
float scaleFactor = 1;
float PI2 = PI*0.5;
int selectedChar = 0;
String[] diffuseTexPath = new String[2];
String[] normalTexPath = new String[2];
String[] specularTexPath = new String[2];
String[] fastLightStateName = new String[3];

boolean useRed = true, useGreen = true, useBlue = true;
boolean useFastLight = true;
boolean isUpActive = false, isDownActive = false;
int selectedLightChannel = -1;
int[] lightColor = new int[3];
int[] ambientLightColor = new int[4];
float[] ambientLightColorFloat = new float[4];

boolean useTexture = true, useLight = true, useNormal = true;
boolean useAmbient = true, useDiffuse = true, useSpecular = true;
boolean useSpecularMapping = true;
int oriWidth = 640, oriHeight = 360;
String overlayStatus = "Hello", selectedLightColor;
int fastLightState = 0;
int msDelay = 100;
int lastAcceptedKeyMillis = 0, countMillis = 0;

PGraphics cube;

PGraphics render, overlay;

void updateStatus() {
  switch (fastLightState) {
    case 0:
      selectedLightColor = "";
      break;
    case 1:
      selectedLightColor = (selectedLightChannel == 0 ? ">" + lightColor[0] + "<" : lightColor[0])
                         + "," 
                         + (selectedLightChannel == 1 ? ">" + lightColor[1] + "<" : lightColor[1]) 
                         + ","
                         + (selectedLightChannel == 2 ? ">" + lightColor[2] + "<" : lightColor[2]);
      break;
    case 2:
      selectedLightColor = (selectedLightChannel == 0 ? ">" + ambientLightColor[0] + "<" : ambientLightColor[0])
                         + "," 
                         + (selectedLightChannel == 1 ? ">" + ambientLightColor[1] + "<" : ambientLightColor[1]) 
                         + ","
                         + (selectedLightChannel == 2 ? ">" + ambientLightColor[2] + "<" : ambientLightColor[2]);
      break;
          
 }
 overlayStatus =  "Fast light mode (Easy, Manual, Ambient): " + fastLightStateName[fastLightState] + ". (F)\n" +
                  (fastLightState == 0 ? "Change light active RGB. (1,2,3)\n" :
                   "Select light RGB component. (1,2,3)\n" +
                   "  Use Left and Right arrows to choose different channels.\n" +
                   "  Use Up and Down arrows to change values: (" 
                   + selectedLightColor
                   + ").\n") +
                  "Character: " + selectedChar + ". (C)\n" +
                  "Texture: " + (useTexture ? "on" : "off") + ". (T)\n" +
                  "Light: " + (useLight ? "on" : "off") + ". (L)\n" +
                  "Normal: " + (useNormal ? "on" : "off") + ". (N)\n" +
                  "Ambient: " + (useAmbient ? "on" : "off") + ". (A)\n" +
                  "Diffuse: " + (useDiffuse ? "on" : "off") + ". (D)\n" +
                  "Specular: " + (useSpecular ? "on" : "off") + ". (S)\n" +
                  "Specular Mapping: " + (useSpecularMapping ? "on" : "off") + ". (X)\n" +
                  "Reset. (R)\n" +
                  "(" + mouseX + "," + mouseY + ") " + 
                  "(" + width + "," + height + ")"; 
}

void reset() {
  useTexture = useLight = useNormal = useAmbient = true;
  useDiffuse = useSpecular = useSpecularMapping = useAmbient;
  useRed = useGreen = useBlue = useFastLight = true;
  lightColor[0] = lightColor[1] = lightColor[2] = 255;
  ambientLightColor[0] = ambientLightColor[1] = ambientLightColor[2] = ambientLightColor[3] = 255;
  ambientLightColorFloat[0] = ambientLightColorFloat[1] = ambientLightColorFloat[2] = ambientLightColorFloat[3] = 1.0;
  fastLightStateName[0] = "Easy RGB";
  fastLightStateName[1] = "Manual RGB";
  fastLightStateName[2] = "Ambient manual RGB";
  selectedLightChannel = -1;
  phong.set("useTexture", useTexture);
  phong.set("useLight", useLight);
  phong.set("useNormal", useNormal);
  phong.set("useAmbient", useAmbient);
  phong.set("useDiffuse", useDiffuse);
  phong.set("useSpecular", useSpecular);
  phong.set("useSpecularMapping", useSpecularMapping);
  phong.set("Ka", 0.1);
  phong.set("Kd", 1.0);
  phong.set("Ks", 1.0);
  phong.set("ambientLightColor", ambientLightColorFloat, 4);
}

void setup() {
  size(640, 360, P3D);
  render = createGraphics(width,height,P3D);
  overlay = createGraphics(width,height+100,P3D);
  cube = createGraphics(width, height, P3D);
  render.noStroke();
  diffuseTexPath[0] = "Texturas/char1_d.png";
  diffuseTexPath[1] = "Texturas/char2_d.png";
  
  normalTexPath[0] = "Texturas/char1_n.png";
  normalTexPath[1] = "Texturas/char2_n.png";

  specularTexPath[0] = "Texturas/char1_s.png";
  specularTexPath[1] = "Texturas/char2_s.png";
  
  phong = loadShader("PhongFrag.glsl", "PhongVert.glsl");
  defaultShader = loadShader("DefaultFrag.glsl", "DefaultVert.glsl");
  for (int i = 0; i < 2; i++) {
    diffuseTex[i] = loadImage(diffuseTexPath[i]);
    normalTex[i] = loadImage(normalTexPath[i]);
    specularTex[i] = loadImage(specularTexPath[i]);
  }
  reset();
  textureMode(NORMAL);
  camera(width/2, height/2, 300, width/2, height/2, 0, 0, 1, 0);
  updateStatus();
}

void drawText() {
 overlay.textAlign(LEFT,TOP);
 overlay.textSize(20);
 overlay.fill(255, 255, 255, 255);
 overlay.text(overlayStatus,0,0);
}

void updateAmbientLightColorFloat() {
  for (int i = 0; i < 4; i++) {
    ambientLightColorFloat[i] = ambientLightColor[i]/255.0;
  }
}

void drawImagePlane() {
  translate(width/2, height/2);
  phong.set("normalTexture", normalTex[selectedChar]);
  phong.set("specularTexture", specularTex[selectedChar]);
  updateAmbientLightColorFloat();
  phong.set("ambientLightColor", ambientLightColorFloat, 4);
  shader(phong);
  beginShape(QUADS);
  texture(diffuseTex[selectedChar]);
  normal(0, 0, 1);
  fill(50, 50, 200);
  int w = int(diffuseTex[selectedChar].width*scaleFactor);
  int h = int(diffuseTex[selectedChar].height*scaleFactor);
  int w2 = w/2;
  int h2 = h/2;
  
  vertex(-w2, +h2, 0, 1);
  vertex(+w2, +h2, 1, 1);
  vertex(+w2, -h2, 1, 0);
  vertex(-w2, -h2, 0, 0);
  endShape();
}

void setLight() {
  float dirY = ((mouseY / float(height)) -0.5)*2.0;
  float dirX = ((mouseX / float(width)) -0.5)*2.0;
  float phi = dirX*PI2;
  float theta = dirY*PI2;
  float nx = dirX;
  float ny = dirY;
  float nz = cos(phi)*cos(theta);
  float norm = sqrt(nx*nx + ny*ny + nz*nz);
  nx /= norm;
  ny /= norm;
  nz /= norm;
  if (fastLightState == 0) {
    directionalLight((useRed ? 255 : 0),
                     (useGreen ? 255 : 0),
                     (useBlue ? 255 : 0),
                     nx, -ny, -nz);
  } else if (fastLightState > 0) {
    directionalLight(lightColor[0],
                     lightColor[1],
                     lightColor[2],
                     nx, -ny, -nz); 
  }
  updateStatus();
}

void drawRender() {
  setLight();
  drawImagePlane();
}

void drawOverlay() {
  shader(defaultShader);
  overlay.beginDraw();
  overlay.background(0,0,0,0);
  drawText();
  overlay.endDraw();
  image(overlay,-width/2 + 10,-height/2 + 10);
}

void updateColorLevel(int value) {
  if (lastAcceptedKeyMillis + (msDelay*(5/(pow(2,1+countMillis)))) > millis()) {
    return;
  }
  lastAcceptedKeyMillis = millis();
  countMillis++;
  if (selectedLightChannel > -1 && selectedLightChannel < 3) {
    if (fastLightState == 1) {
      lightColor[selectedLightChannel] = min(255,max(0,
              lightColor[selectedLightChannel] + value));
    } else if (fastLightState == 2) {
      ambientLightColor[selectedLightChannel] = min(255,max(0,
              ambientLightColor[selectedLightChannel] + value));
    }
  }
}

void draw() {
  background(0);
  drawRender();
  drawOverlay();
  if (isUpActive) updateColorLevel(1);
  if (isDownActive) updateColorLevel(-1);
  //image(render,0,0);
  //image(overlay,0,0);
  //drawCube();
  //image(cube, 0, 0);
  //fill(0,255,0);
  //translate(0,0,-100);
  //sphere(120);
}


void keyReleased() {
  if (key == 't') {
    useTexture = !useTexture;
    phong.set("useTexture", useTexture);
  }
  if (key == 'l') {
    useLight = !useLight;
    phong.set("useLight", useLight);
  }
  if (key == 'n') {
    useNormal = !useNormal;
    phong.set("useNormal", useNormal);
  }
  if (key == 'a') {
    useAmbient = !useAmbient;
    phong.set("useAmbient", useAmbient);
  }
  if (key == 'd') {
    useDiffuse = !useDiffuse;
    phong.set("useDiffuse", useDiffuse);
  }
  if (key == 's') {
    useSpecular = !useSpecular;
    phong.set("useSpecular", useSpecular);
  }
  if (key == 'x') {
    useSpecularMapping = !useSpecularMapping;
    phong.set("useSpecularMapping", useSpecularMapping);
  }
  if (key == 'c') {
    selectedChar = 1-selectedChar;
  }
  if (key == 'r') {
    reset();
  }
  if (key == 'f') {
    fastLightState = (fastLightState+1)%3;
  }
  
  // Color parameters
  if (fastLightState == 0) {
    if (key == '1') {
      useRed = !useRed;
    }
    if (key == '2') {
      useGreen = !useGreen;
    }
    if (key == '3') {
      useBlue = !useBlue;
    }
  } else {
    if (key == '1') {
      selectedLightChannel = (selectedLightChannel == 0 ? -1 : 0);
    }
    if (key == '2') {
      selectedLightChannel = (selectedLightChannel == 1 ? -1 : 1);
    }
    if (key == '3') {
      selectedLightChannel = (selectedLightChannel == 2 ? -1 : 2);
    }
    if (keyCode == UP) {
      isUpActive = false;
      countMillis = 0;
    }
    if (keyCode == DOWN) {
      isDownActive = false;
      countMillis = 0;
    }
    if (keyCode == LEFT) {
      if (selectedLightChannel > -1)
      selectedLightChannel = min(2,max(0,selectedLightChannel-1));
    }
    if (keyCode == RIGHT) {
      if (selectedLightChannel > -1)
      selectedLightChannel = min(2,max(0,selectedLightChannel+1));
    } 
  }
 
  updateStatus();
}

void keyPressed() {
 if (fastLightState > 0) {
  if (keyCode == UP) {
    isUpActive = true;
  } else if (keyCode == DOWN) {
    isDownActive = true;
  } 
 }
}
