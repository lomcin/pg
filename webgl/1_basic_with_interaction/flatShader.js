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
            uniform ivec2 mouse;
            uniform ivec2 viewPortSize;
            void main() {
                float dis = distance(vec2(mouse),gl_FragCoord.xy);
                float relative = dis/float(viewPortSize.y)*2.0;
                float alpha = 1.0-relative;
                gl_FragColor = vec4(vec3(color)*alpha, 1);
            }
        `;

        super(gl, vertex, fragment);
    }
}