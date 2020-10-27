
float period = 4;
float period_in_frames;

void setup() {
 size(500, 500, P3D);
 period_in_frames = frameRate*period;
}

void drawAxis() {
  stroke(255,0,0);
  line(0,0,0,100,0,0);
  stroke(0,255,0);
  line(0,0,0,0,100,0); 
  stroke(0,0,255);
  line(0,0,0,0,0,100); 
}

void draw() {
  // Re-creates the default perspective
  background(200);
  strokeWeight(3);
  noFill();
  float fov = PI/3.0;
  float cameraZ = (height/2.0) / tan(fov/2.0);
  perspective(fov, float(width)/float(height), 
              cameraZ/10.0, cameraZ*10.0);
  
  translate(width/2.0, height/2.0, 0);
  rotateX(-PI/6);
  rotateY((frameCount/period_in_frames)*PI/3);
  //scale(1,-1,1);
  rotateX(PI/2);
  drawAxis();
  stroke(0,0,0);
  box(200);
}
