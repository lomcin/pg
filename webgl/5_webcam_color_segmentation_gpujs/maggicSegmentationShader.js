class MaggicSegmentationShader extends Shader {
    constructor (gl) {
        
        var vertex = `
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            
            uniform mat4 u_projMatrix;
            uniform float u_filterGrayThreshold;
            uniform float u_hueVector[7];
            uniform vec3 u_colorVector[7];
            
            varying vec2 v_texcoord;
            
            void main() {
                // Multiply the position by the matrix.
                gl_Position = u_projMatrix * vec4(a_position,0,1);
                // gl_Position = vec4(a_position,0,1);
                
                // Pass the texcoord to the fragment shader.
                v_texcoord = a_texcoord;
            }
        `;

        var fragment = `
            precision highp float;
    
            // Passed in from the vertex shader.
            varying vec2 v_texcoord;
            uniform float u_filterGrayThreshold;
            uniform float u_hueVector[7];
            uniform vec3 u_colorVector[7];
            
            // The texture.
            uniform sampler2D u_texture;

            vec3 rgb2hsv(vec3 a) {
                // From https://www.rapidtables.com/convert/color/rgb-to-hsv.html
                float cmax = max(max(a.x,a.y),a.z);
                float cmin = min(min(a.x,a.y),a.z);
                float delta = cmax-cmin;
                float h = 0.0;
                float s = 0.0;
                float v = cmax;
                float factor = (60.0/360.0);

                // Hue
                if (delta != 0.0) {
                    if (cmax == a.x) { // Red
                        h = factor*mod((a.y-a.z)/delta, 6.0);
                    } else if (cmax == a.y) { // Green
                        h = factor*(((a.z-a.x)/delta) + 2.0);
                    } else if (cmax == a.z) { // Blue
                        h = factor*(((a.x-a.y)/delta) + 4.0);
                    }
                }

                // Saturation
                if (cmax != 0.0) {
                    s = delta/cmax;
                }

                return vec3(h,s,v);
            }

            vec3 hsv2rgb(vec3 a) {
                // From https://www.rapidtables.com/convert/color/hsv-to-rgb.html
                float h = a.x*360.0;
                float s = a.y;
                float v = a.z;

                float c = v*s; // V*S
                float x = c*(1.0- abs( mod(h/60.0,2.0) -1.0));
                float m = v-c; // V-C
                vec3 rgb = vec3(0.0,0.0,0.0);

                // RGB conversion conditionals
                if (h < 60.0) {
                    rgb = vec3(c,x,0.0);
                } else if (60.0 <= h  && h < 120.0) {
                    rgb = vec3(x,c,0.0);
                } else if (120.0 <= h  && h < 180.0) {
                    rgb = vec3(0.0,c,x);
                } else if (180.0 <= h  && h < 240.0) {
                    rgb = vec3(0.0,x,c);
                } else if (240.0 <= h  && h < 300.0) {
                    rgb = vec3(x,0.0,c);
                } else if (300.0 <= h  && h <= 360.0) {
                    rgb = vec3(c,0.0,x);
                }

                return rgb + vec3(m,m,m);
            }

            vec3 filterGray(vec3 a) {
                float men = min(min(a.x,a.y),a.z);
                float lower_bound = max(men - u_filterGrayThreshold, 0.0);
                float upper_bound = min(men + u_filterGrayThreshold, 1.0);
                vec3 color = vec3(0.0,0.0,0.0);
                if (a.x > lower_bound && a.x <= upper_bound &&
                    a.y > lower_bound && a.y <= upper_bound &&
                    a.z > lower_bound && a.z <= upper_bound) {
                    color = vec3(0.0,0.0,0.0);
                } else {
                    color = a;
                }
                return color;
            }

            int getColorCodeFromHue(float hue) {
                float dist = 1000.0;
                int selected = 0;
                for (int i = 0; i < 7; i++) {
                    // float absd = min(abs(hue-u_hueVector[i]),abs(mod(hue-u_hueVector[i]+1.0,1.0)));
                    float absd = abs(hue-u_hueVector[i]);
                    if (absd < dist) {
                        dist = absd;
                        selected = i;
                    }
                }
                return selected;
            }
            
            void main() {
                vec3 rgbColor = texture2D(u_texture, v_texcoord).rgb;
                vec3 rgbFiltered = filterGray(rgbColor);
                // vec3 rgbFinal = vec3(0.0,0.0,0.0);
                vec3 rgbFinal = rgbFiltered;
                vec3 hsvColor;
                int colorCode = 0;
                if (rgbFiltered.r == 0.0 && rgbFiltered.g == 0.0 && rgbFiltered.b == 0.0) {

                } else {
                    hsvColor = rgb2hsv(rgbFiltered);
                    colorCode = getColorCodeFromHue(hsvColor.x);
                    if (colorCode == 0) {
                        rgbFinal = u_colorVector[0];
                    } else if (colorCode == 1) {
                        rgbFinal = u_colorVector[1];
                    } else if (colorCode == 2) {
                        rgbFinal = u_colorVector[2];
                    } else if (colorCode == 3) {
                        rgbFinal = u_colorVector[3];
                    } else if (colorCode == 4) {
                        rgbFinal = u_colorVector[4];
                    } else if (colorCode == 5) {
                        rgbFinal = u_colorVector[5];
                    } else if (colorCode == 6) {
                        rgbFinal = u_colorVector[6];
                    }
                    // rgbFinal = vec3(1,1,1);
                }
                // gl_FragColor = vec4(red, green, blue, 1.0);
                gl_FragColor = vec4(rgbFinal,1.0);
            }
        `;

        super(gl, vertex, fragment);
    }
}