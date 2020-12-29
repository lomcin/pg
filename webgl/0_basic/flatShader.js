class FlatShader extends Shader {
    constructor (gl) {
        
        var vertex = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        var fragment = `
            precision highp float;
            uniform vec4 color;
            void main() {
                gl_FragColor = color;
            }
        `;

        super(gl, vertex, fragment);
    }
}