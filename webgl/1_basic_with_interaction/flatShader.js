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
            uniform int mouseX;
            void main() {
                if (int(gl_FragCoord.x) < mouseX) {
                    gl_FragColor = color;
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }
        `;

        super(gl, vertex, fragment);
    }
}