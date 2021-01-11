var canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.top = '0px'
canvas.style.left = '0px'
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.style.position = 'absolute'
document.body.appendChild(canvas)

var webcamReady = false;

var video      = document.createElement('video');
// video.width    = 640;
// video.height   = 480;
video.autoplay = true;


var gl = canvas.getContext('webgl')

var texShader = new TexShader(gl);
var grayscaleShader = new GrayscaleShader(gl);
var program = new Program(gl, grayscaleShader);

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

var bliss_image = new Image();
bliss_image.crossOrigin = "anonymous";   // ask for CORS permission
bliss_image.src = "bliss512.jpg";


var mouseX = 400;
var mouseY = 400;
function draw() {
    gl.viewport(0,0,gl.canvas.clientWidth, gl.canvas.clientHeight)
    
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
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
                width: { min: 1920, ideal: 1920, max: 1920 },
                height: { min: 1080, ideal: 1080, max: 1080 }
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
cameraStart();
draw();