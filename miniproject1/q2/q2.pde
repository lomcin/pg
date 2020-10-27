float uc = 20;

float ball_radius = 0.2*uc;
float[] bx = new float[3], by = new float[3];
float[] ang = new float[3];
float[] ang_speed = new float[3];
float ball_diameter = ball_radius*2;
int anim_frames;


int frame = 0;

void setup() {
  size(500,400); //250uc x 200uc
  anim_frames = int(frameRate*2);
  frame = 0;
  ang_speed[0] = 0;
  ang_speed[1] = (PI/4.0)/float(anim_frames);
  ang_speed[2] = ang_speed[1];
  
  for (int i=0;i<3;i++) {
    ang[i] = 0;
    bx[i] = 0;
  }
  for (int i=1;i<3;i++) {
    by[i] = (i+1)*uc;
  }
  bx[0] = width/2;
  by[0] = height/3;
  //resetMatrix();
}

void draw() {

  background(20,80,240);
  
  // Draw elements
  
  // Lines
  strokeWeight(ball_diameter);
  stroke(0,0,0);
  resetMatrix();
  for (int i=1;i<3;i++) {
    translate(bx[i-1], by[i-1]);
    rotate(ang[i]);
    line(0, 0, bx[i], by[i]);
  }
  
  // Balls
  strokeWeight(1);
  stroke(255,255,255);
  fill(255,255,255);
  resetMatrix();
  for (int i=0;i<3;i++) {
    rotate(ang[i]);
    translate(bx[i], by[i]);
    ellipse(0, 0, ball_diameter, ball_diameter);
  }
  
  frame++;
  if (frame == anim_frames) {
    setup();
  } else {
    for (int i=0;i<3;i++) {
      ang[i] -= ang_speed[i];
    }
  }
}
