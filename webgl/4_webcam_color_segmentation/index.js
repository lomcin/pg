var canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.top = '0px'
canvas.style.left = '0px'
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.style.position = 'absolute'
document.body.appendChild(canvas)
window.addEventListener('resize',(e) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
var filterGrayThreshold = 0;
window.addEventListener('wheel',(e) => {
    if (e.deltaY < 0) {
        filterGrayThreshold = Math.min(filterGrayThreshold+1,255);
    } else if (e.deltaY > 0) {
        filterGrayThreshold = Math.max(filterGrayThreshold-1,0);
    }
});

var webcamReady = false;

var video      = document.createElement('video');
// video.width    = 640;
// video.height   = 480;
video.autoplay = true;


var gl = canvas.getContext('webgl')

var texShader = new TexShader(gl);
var theShader = new MaggicSegmentationShader(gl);
var program = new Program(gl, theShader);

console.log(program.getShaderInfoLog());

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
program.enable2DVertexAttrib('a_position')

var positionLoc = gl.getAttribLocation(program.getProgram(), "a_position");
var projMatrixLoc = gl.getUniformLocation(program.getProgram(), "u_projMatrix");
var filterGrayThresholdLoc = gl.getUniformLocation(program.getProgram(), "u_filterGrayThreshold");
var hueVectorLoc = gl.getUniformLocation(program.getProgram(), "u_hueVector");
var colorVectorLoc = gl.getUniformLocation(program.getProgram(), "u_colorVector");

var texcoordLocation = gl.getAttribLocation(program.getProgram(), "a_texcoord");
var texCoord = new Float32Array([
    1, 1,
    1, 0,
    0, 0,
    
    0, 0,
    0, 1,
    1, 1
])

// Create a buffer for texcoords.
var texcoordbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordbuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoord, gl.STATIC_DRAW);
program.enable2DVertexAttrib('a_texcoord')


var projMatrix = new Float32Array([
    1, 0, 0 ,0,
    0, 1, 0, 0, 
    0, 0, 1, 0,
    0, 0, 0, 1
])

gl.uniformMatrix4fv(projMatrixLoc, false, projMatrix);
gl.uniform1f(filterGrayThresholdLoc, filterGrayThreshold/255.0);
var hueVectorFrom255 = new Float32Array([
    255, // Red = -1
    7, // Orange
    43, // Yellow
    97, // Green
    140, // Cyan
    151, // Blue
    235 //Magenta
]);
var hueVector = new Float32Array(7);
for (let i = 0; i < 7; i++){
    hueVector[i] = hueVectorFrom255[i]/255.0;
}
gl.uniform1fv(hueVectorLoc, hueVector);

var colorVector = new Float32Array([
    1, 0, 0, // Red = -1
    1, 0.5, 0, // Orange
    1, 1, 0, // Yellow
    0, 1, 0, // Green
    0, 1, 1, // Cyan
    0, 0, 1, // Blue
    1, 0, 1 //Magenta
]);
gl.uniform3fv(colorVectorLoc, colorVector);

var bliss_image = new Image();
bliss_image.crossOrigin = "anonymous";   // ask for CORS permission
bliss_image.src = "bliss512.jpg";


var mouseX = 400;
var mouseY = 400;
function draw() {
    // gl.viewport(0,0,gl.canvas.clientWidth, gl.canvas.clientHeight)
    gl.viewport(0,0,window.innerWidth, window.innerHeight)
    
    
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    projMatrix = new Float32Array([
        1, 0, 0 ,0,
        0, 1, 0, 0, 
        0, 0, 1, 0,
        0, 0, 0, 1
    ])

    gl.uniformMatrix4fv(projMatrixLoc, false, projMatrix);
    gl.uniform1f(filterGrayThresholdLoc, filterGrayThreshold/255.0);
    gl.uniform1fv(hueVectorLoc, hueVector);
    gl.uniform3fv(colorVectorLoc, colorVector);

    
    if (webcamReady) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, video);
    }
        
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2)
    
    gl.finish();
    
    requestAnimationFrame(draw,canvas);
    
};

var texture = gl.createTexture();
bliss_image.onload = (e) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, e.target);
    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    //draw();
}

document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};


function hasGetUserMedia() {
    // return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    return true;
}
async function cameraStart() {

    if (hasGetUserMedia()) {
        // alert("opa")
        var constraints = {
            video: {
                facingMode : "user",
                // width: { min: 1920, ideal: 1920, max: 1920 },
                // height: { min: 1080, ideal: 1080, max: 1080 }
                width: { min: 640, ideal: 640, max: 640 },
                height: { min: 480, ideal: 480, max: 480 }
            }
        };
        navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream){
            video.srcObject = stream;
            console.log('running')
            webcamReady = true;
        }).catch(function(error){
            console.log("Failed to get a stream due to", error);
        });
    } else {
        alert("getUserMedia() is not supported by your browser");
    }
}
window.addEventListener("load", cameraStart, false);
draw();