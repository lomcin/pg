class Shader {
    constructor(gl, vertex, fragment){
        this.gl = gl;
        this.vertex = vertex;
        this.fragment = fragment;

        // Setting up vertex shader
        if (vertex == null) {
            this.vtx = null;
        } else {
            this.vtx = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(this.vtx, vertex)
            gl.compileShader(this.vtx)
        }

        // Setting up fragment shader
        if (fragment == null) {
            this.frag = null;
        } else {
            this.frag = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(this.frag, fragment)
            gl.compileShader(this.frag)
        }
    }
    getVertexShader() {
        return this.vtx;
    }
    getFragmentShader() {
        return this.frag;
    }
    getOriginalVertexShader() {
        return this.vertex;
    }
    getOriginalFragmentShader() {
        return this.fragment;
    }
}