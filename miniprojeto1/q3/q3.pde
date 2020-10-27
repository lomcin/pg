float arc_radius = 20;
float arc_diameter = arc_radius*2;
float arc_center = 0;
float signal = -1;
float period = 4;
float period_in_frames = 0;
float frame = 0;

void setup() {
 size(500,400);
 background(200);
 resetMatrix();
 translate(width/2,height/2);
 
 stroke(0,0,200);
 line(-width/2, 0, width, 0);
 stroke(0,255,0);
 line(0, -height/2, 0, height);
 noFill();
 stroke(255,0,0,128);
 strokeWeight(4);
 period_in_frames = frameRate*period;
 frame = 0;
}

void draw() {
 pushMatrix();
 if (frame < period_in_frames) {
   translate(width/2,height/2);
   scale(1*signal,-1*signal);
   arc(signal*arc_center, 0, arc_diameter, arc_diameter, PI*frame/period_in_frames, PI*(frame+1)/period_in_frames);
   frame++;
 } else {
   arc_center = arc_center + signal*arc_radius;
   signal *= -1;
   arc_radius *=2;
   arc_diameter = arc_radius*2;
   frame = 0;
 }
 popMatrix();
}
