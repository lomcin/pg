float uc = 1;
float big_radius = 100*uc;
float med_radius = 25*uc;
float big_diameter = 2*big_radius;
float med_diameter = 2*med_radius;
float period = 4;
float period_in_frames = 0;
int frame = 0;

void setup() {
  size(500,400);
  
 period_in_frames = frameRate*period;
}


void draw() {
 background(200);
 stroke(0,0,200);
 translate(width/2,height/2);
 // Axis
 //line(-width/2, 0, width, 0);
 //stroke(0,255,0);
 //line(0, -height/2, 0, height);
 noFill();
 stroke(0,0,255);
 ellipse(0,0,big_diameter,big_diameter);
 pushMatrix();
 rotate(-frame*2*PI/period_in_frames);
 translate(0,big_radius-med_radius);
 ellipse(0,0,med_diameter,med_diameter);
 
 rotate((big_radius/med_radius)*frame*2*PI/period_in_frames);
 
 translate(0,med_radius);
 
 stroke(255,0,0);
 ellipse(0,0,2,2);
 popMatrix();
 frame++;
}
