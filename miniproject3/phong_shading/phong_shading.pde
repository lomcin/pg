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

boolean useRed = true, useGreen = true, useBlue = true;

boolean useTexture = true, useLight = true, useNormal = true;
boolean useAmbient = true, useDiffuse = true, useSpecular = true;
boolean useSpecularMapping = true;
int oriWidth = 640, oriHeight = 360;
String overlayStatus = "Hello";

PGraphics cube;

PGraphics render, overlay;

void updateStatus() {
 overlayStatus =  "Change light active RGB. (1,2,3)\n" +
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
  useRed = useGreen = useBlue = true;
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
}

void setup() {
  size(640, 360, P3D);
  render = createGraphics(width,height,P3D);
  overlay = createGraphics(width,height,P3D);
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
  //blendMode(BLEND);
  //render.
  textureMode(NORMAL);
  //render.
  camera(width/2, height/2, 300, width/2, height/2, 0, 0, 1, 0);
  updateStatus();
}

void drawText() {
 //resetMatrix();
 //overlay.beginCamera();
 //overlay.ortho(0,width,0,height);
 overlay.textAlign(LEFT,TOP);
 overlay.textSize(20);
 overlay.fill(255, 255, 255, 255);
 overlay.text(overlayStatus,0,0);
 //overlay.endCamera();
}

void drawImagePlane() {
  //resetMatrix();
  //render.beginCamera();
  //render.camera(width/2, height/2, 300, width/2, height/2, 0, 0, 1, 0);
  //render.
  translate(width/2, height/2);
  phong.set("normalTexture", normalTex[selectedChar]);
  phong.set("specularTexture", specularTex[selectedChar]);
  //render.
  shader(phong);
  //render.
  beginShape(QUADS);
  //render.
  texture(diffuseTex[selectedChar]);
  //render.
  normal(0, 0, 1);
  //render.
  fill(50, 50, 200);
  int w = int(diffuseTex[selectedChar].width*scaleFactor);
  int h = int(diffuseTex[selectedChar].height*scaleFactor);
  int w2 = w/2;
  int h2 = h/2;
  
  //render.
  vertex(-w2, +h2, 0, 1);
  //render.
  vertex(+w2, +h2, 1, 1);
  //render.fill(200, 50, 50);
  //render.
  vertex(+w2, -h2, 1, 0);
  //render.
  vertex(-w2, -h2, 0, 0);
  //render.
  endShape(); 
  //render.endCamera();
}

void setLight() {
  float dirY = ((mouseY / float(height)) -0.5)*2.0;
  float dirX = ((mouseX / float(width)) -0.5)*2.0;
  float phi = dirX*PI2;
  float theta = dirY*PI2;
  //print(dirX + "," + dirY+ "\n");
  float nx = dirX;
  float ny = dirY;
  float nz = cos(phi)*cos(theta);
  float norm = sqrt(nx*nx + ny*ny + nz*nz);
  nx /= norm;
  ny /= norm;
  nz /= norm;
  //render.lights();
  //print(dirX + "," + dirY+ " " + nx + "," + ny + "," + nz +"\n");
  //render.
  directionalLight((useRed ? 255 : 0),
                   (useGreen ? 255 : 0),
                   (useBlue ? 255 : 0),
                   nx, -ny, -nz);
  updateStatus();
}
void drawCube() { 
  cube.beginDraw();
  cube.lights();
  cube.background(0);
  cube.noStroke();
  cube.translate(width/2, height/2);
  cube.rotateX(frameCount/100.0);
  cube.rotateY(frameCount/200.0);
  cube.box(40);
  cube.endDraw();
}
void drawRender() {
  //render.
  //beginDraw();
  //render.
  //background(0,200,0,0);
  setLight();
  drawImagePlane();
  //render.
  //endDraw();
  //image(render,0,0);
}

void drawOverlay() {
  shader(defaultShader);
  overlay.beginDraw();
  overlay.background(0,0,0,0);
  drawText();
  overlay.endDraw();
  image(overlay,-width/2 + 10,-height/2 + 10);
}
void draw() {
  background(0);
  drawRender();
  drawOverlay();

 
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
  
  // Color parameters
  if (key == '1') {
    useRed = !useRed;
  }
  if (key == '2') {
    useGreen = !useGreen;
  }
  if (key == '3') {
    useBlue = !useBlue;
  }
 
  updateStatus();
}
