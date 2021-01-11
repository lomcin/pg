class GrayscaleShader extends Shader {
    constructor (gl) {
        
        var vertex = `
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            
            uniform mat4 u_matrix;
            
            varying vec2 v_texcoord;
            
            void main() {
                // Multiply the position by the matrix.
                //gl_Position = u_matrix * a_position;
                gl_Position = vec4(a_position,0,1);
                
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
                float gray = rgbColor.x*0.2126 + rgbColor.y*0.7152 + rgbColor.z*0.0722;
                gl_FragColor = vec4(gray, gray, gray, 1.0);
            }
        `;

        super(gl, vertex, fragment);
    }
}