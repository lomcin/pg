var canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.top = '0px'
canvas.style.left = '0px'
canvas.style.position = 'absolute'
document.body.appendChild(canvas)


var gl = canvas.getContext('webgl')

gl.clearColor(1,0,1,1)
gl.clear(gl.COLOR_BUFFER_BIT)


var flatShader = new FlatShader(gl);
var program = new Program(gl, flatShader);

var vertices = new Float32Array([
    -0.5, -0.5,
    0.5,-0.5,
    0.0,0.5
])

var buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

program.use();
program.setUniform4fv('color', [0, 1, 0, 1.0])
program.enable2DVertexAttrib('position')

gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2)

gl.finish();