float uc = 0.5;

float ball_radius = 30*uc;
float ball_ay = 0.2*uc; // This is per frame squared
float ball_x = 0, ball_y = 0;
float ball_vx = 0, ball_vy = -10*uc;
float ball_diameter = ball_radius*2;

float floor_y = 200;
float right_limit = width - ball_radius;
float left_limit = ball_radius;
float floor_limit = floor_y - ball_radius;
float period = 4; // in seconds
float period_in_frames;
float floor_height = 200;

int frame = 0;

void setup() {
  size(500,400); //250uc x 200uc
  background(200);
  floor_y = height-floor_height;
  floor_limit = floor_y - ball_radius;
  period_in_frames = frameRate*period;
  ball_x = ball_radius;
  ball_y = floor_y - ball_radius;
  right_limit = width - ball_radius;
  ball_vx = 2*(width-ball_diameter)/period_in_frames;
}

void draw() {
  
  // Updating position and velocity
  ball_vy = ball_vy + ball_ay;
  ball_x = ball_x + ball_vx;
  ball_y = ball_y + ball_vy;
  
  
  // Treating collisions
  if (ball_x < left_limit) {
   ball_x = left_limit - (ball_x-left_limit);
   ball_vx = - ball_vx;
  } else if (ball_x > right_limit) { 
    ball_x = right_limit - (ball_x-right_limit);
    ball_vx = - ball_vx;
  }
  
  if (ball_y > floor_limit) {
    ball_y = floor_limit - (ball_y - floor_limit);
    ball_vy = -10*uc;
  }
  background(200);
  // Draw elements
  stroke(0);
  
  // Blue ball
  fill(0,0,255);
  ellipse(ball_x, ball_y, ball_diameter, ball_diameter);
  
  // Red floor
  fill(255,0,0);
  rect(0,floor_y,500,floor_height);
  
  frame++;
}
