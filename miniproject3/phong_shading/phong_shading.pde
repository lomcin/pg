PShader phong;
PImage[] difuseTex = new PImage[2];
PImage[] normalTex = new PImage[2];
float scaleFactor = 1;
float PI2 = PI*0.5;
int selectedChar = 0;
String[] difuseTexPath = new String[2];
String[] normalTexPath = new String[2];

void setup() {
  size(640, 360, P3D);
  noStroke();
  fill(204);
  difuseTexPath[0] = "Texturas/char1_d.png";
  difuseTexPath[1] = "Texturas/char2_d.png";
  normalTexPath[0] = "Texturas/char1_n.png";
  normalTexPath[1] = "Texturas/char2_n.png";
  phong = loadShader("PhongFrag.glsl", "PhongVert.glsl");
  for (int i = 0; i < 2; i++) {
    difuseTex[i] = loadImage(difuseTexPath[i]);
    normalTex[i] = loadImage(normalTexPath[i]);
  }
  phong.set("useTexture", true);
  phong.set("useLight", true);
  phong.set("useNormal", true);
  phong.set("normalTexture", normalTex[selectedChar]);
  //phong.set("difuse", true);
  //phong.set("specular", true);
  phong.set("Kd", 1.0);
  //phong.set("Ks", 1);
  camera(width/2, height/2, 300, width/2, height/2, 0, 0, 1, 0);
  shader(phong);
  textureMode(NORMAL);
}

void draw() {
  background(0);
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
  translate(width/2, height/2);
  print(dirX + "," + dirY+ " " + nx + "," + ny + "," + nz +"\n");
  directionalLight(255,255,255, nx, -ny, -nz);
  
  beginShape(QUADS);
  texture(difuseTex[selectedChar]);
  normal(0, 0, 1);
  //normal(normal_img);
  fill(50, 50, 200);
  int w = int(difuseTex[selectedChar].width*scaleFactor);
  int h = int(difuseTex[selectedChar].height*scaleFactor);
  int w2 = w/2;
  int h2 = h/2;
  
  vertex(-w2, +h2, 0, 1);
  vertex(+w2, +h2, 1, 1);
  //fill(200, 50, 50);
  vertex(+w2, -h2, 1, 0);
  vertex(-w2, -h2, 0, 0);
  endShape();
  
  //fill(0,255,0);
  //translate(0,0,-100);
  //sphere(120);
}
