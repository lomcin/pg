
float period = 4;
float period_in_frames;
float uc = 0.5;
float big_radius = 100*uc;
float med_radius = 25*uc;
float big_diameter = 2*big_radius;
float med_diameter = 2*med_radius;
float axis_length = 1000;

void setup() {
 size(500, 500, P3D);
 period_in_frames = frameRate*period;
}

void drawAxis() {
  stroke(255,0,0);
  line(0,0,0,axis_length,0,0);
  stroke(0,255,0);
  line(0,0,0,0,axis_length,0); 
  stroke(0,0,255);
  line(0,0,0,0,0,axis_length); 
}

void draw() {
  background(200);
  strokeWeight(3);
  noFill();
  float fov = PI/3.0;
  float cameraZ = (height/2.0) / tan(fov/2.0);
  perspective(fov, float(width)/float(height), 
              cameraZ/10.0, cameraZ*10.0);
  
  translate(width/2.0, height/2.0, 0);
  rotateX(-(mouseY/period_in_frames)*PI/6);
  rotateY(((mouseX-width/2)/period_in_frames)*PI/3.0 -PI/2.0);
  rotateX(PI/2);
  scale(1,-1,1);
  drawAxis();
  stroke(0,0,0);
  //box(200);
  rotateX(PI/3.0);
  // Translate and rotate for center
  rect(0,0,big_diameter,big_diameter);
  translate(big_radius,big_radius,0);
  ellipse(0,0,big_diameter,big_diameter);
 rotateZ(frameCount*2*PI/period_in_frames);
 translate(0,big_radius,med_radius);
 rotateX(PI/2.0);
 ellipse(0,0,med_diameter,med_diameter);
 rotate((big_radius/med_radius)*frameCount*2*PI/period_in_frames - PI);
 translate(0,med_radius);
 
 stroke(255,0,0);
 ellipse(0,0,2,2);
}
