PShader phong;
PImage img;
float scaleFactor = 1;

void setup() {
  size(640, 360, P3D);
  noStroke();
  fill(204);
  phong = loadShader("PhongFrag.glsl", "PhongVert.glsl");
  img = loadImage("Texturas/char1_d.png");
  phong.set("useTexture", true);
  phong.set("useLight", true);
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
  float dirY = (mouseY / float(height) - 0.5) * 2;
  float dirX = (mouseX / float(width) - 0.5) * 2;
  directionalLight(204, 204, 204, -dirX, -dirY, -1);
  translate(width/2, height/2);
  
  beginShape(QUADS);
  texture(img);
  normal(0, 0, 1);
  fill(50, 50, 200);
  int w = int(img.width*scaleFactor);
  int h = int(img.height*scaleFactor);
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
