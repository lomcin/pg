class Program {
    constructor(gl, shader) {
        this.gl = gl;
        this.shader = shader;
        this.program = this.gl.createProgram()
        this.gl.attachShader(this.program, this.shader.getVertexShader())
        this.gl.attachShader(this.program, this.shader.getFragmentShader())
        this.gl.linkProgram(this.program)
    }
    getShader() {
        return this.shader;
    }
    getProgram() {
        return this.program;
    }
    getShaderInfoLog() {
        var vtxmsg = this.gl.getShaderInfoLog(this.shader.getVertexShader());
        var fragmsg = this.gl.getShaderInfoLog(this.shader.getFragmentShader());
        return vtxmsg + fragmsg;
    }
    use() {
        this.gl.useProgram(this.program)
    }
    setUniform4fv(varname, value) {
        var variable = this.gl.getUniformLocation(this.program, varname)
        this.gl.uniform4fv(variable, value)
    }
    setUniform1i(varname, value) {
        var variable = this.gl.getUniformLocation(this.program, varname)
        this.gl.uniform1i(variable, value)
    }
    setUniform2iv(varname, value) {
        var variable = this.gl.getUniformLocation(this.program, varname)
        this.gl.uniform2iv(variable, value)
    }
    enable2DVertexAttrib(varname) {
        var variable = this.gl.getAttribLocation(this.program, varname)
        this.gl.enableVertexAttribArray(variable)
        this.gl.vertexAttribPointer(variable, 2, this.gl.FLOAT, false, 0, 0)
    }
}