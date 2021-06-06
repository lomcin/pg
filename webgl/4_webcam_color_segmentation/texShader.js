class TexShader extends Shader {
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
                gl_FragColor = texture2D(u_texture, v_texcoord);
                // gl_FragColor = vec4(1,0,0,1);
            }
        `;

        super(gl, vertex, fragment);
    }
}