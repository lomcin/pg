var canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.top = '0px'
canvas.style.left = '0px'
canvas.style.position = 'absolute'
document.body.appendChild(canvas)


var gl = canvas.getContext('webgl')

var flatShader = new FlatShader(gl);
var program = new Program(gl, flatShader);

var vertices = new Float32Array([
    -1, -1,
    -1, 1,
    1, 1,

    1, 1,
    1, -1,
    -1, -1
])

var buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

program.use();
program.setUniform4fv('color', [0, 1, 0, 1])
program.enable2DVertexAttrib('position')
var mouseX = 400;
var mouseY = 400;
function draw() {

    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    program.setUniform2iv('mouse', [mouseX,canvas.height-mouseY])
    program.setUniform2iv('viewPortSize', [canvas.width,canvas.height])
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2)
    
    gl.finish();
    
    setTimeout(draw,16);

};
draw();

document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};
document.getElementsByTagName('body')[0].style.cursor = "none";