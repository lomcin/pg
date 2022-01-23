class ColorPrecisionShader extends Shader {
    constructor (gl) {
        
        var vertex = `
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            
            uniform mat4 u_projMatrix;
            
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
            precision mediump float;
    
            // Passed in from the vertex shader.
            varying vec2 v_texcoord;
            
            // The texture.
            uniform sampler2D u_texture;
            
            void main() {
                vec3 rgbColor = texture2D(u_texture, v_texcoord).rgb;
                int redi = int(rgbColor.x*255.0)/32*32;
                int greeni = int(rgbColor.y*255.0)/32*32;
                int bluei = int(rgbColor.z*255.0)/32*32;
                float red = float(redi)/255.0;
                float green = float(greeni)/255.0;
                float blue = float(bluei)/255.0;
                gl_FragColor = vec4(red, green, blue, 1.0);
            }
        `;

        super(gl, vertex, fragment);
    }
}