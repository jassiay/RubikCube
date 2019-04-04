// ECE462 Rubik's Cube
// Jing Jiangs

var canvas;
var gl;
var program;
var cBuffer;
var vColor;
var fileContent;
var fileLoaded = false;
var spacing = 2.1;

var rotationAngle = 3;
var animationTimer = 10;

var numVertices = 36;

var projectionMatrix;
var modelViewMatrix;

var PROJMATRIX = mat4();
var MVMATRIX = mat4();

var eye = vec3(0.0, 0.0, 4.0); 
var at = vec3(0.0, 0.0, 0.0); 
var up = vec3(0.0, 1.0, 0.0); 

// angles
var THETA = radians(30);
var PHI = radians(50);

// perspective
var fovy = 45.0; 
var aspect = 1.0;
var near = 0.3;
var far = 1000;

// zooming
var cameraRadius = 15.0;
var cameraRadiusMinimum = 10 
var cameraRadiusMaximum = 30;

// vertices
var vertices = [
  vec3(-1,-1,-1), vec3( 1,-1,-1), vec3( 1, 1,-1), vec3(-1, 1,-1),
  vec3(-1,-1, 1), vec3( 1,-1, 1), vec3( 1, 1, 1), vec3(-1, 1, 1),
  vec3(-1,-1,-1), vec3(-1, 1,-1), vec3(-1, 1, 1), vec3(-1,-1, 1),
  vec3( 1,-1,-1), vec3( 1, 1,-1), vec3( 1, 1, 1), vec3( 1,-1, 1),
  vec3(-1,-1,-1), vec3(-1,-1, 1), vec3( 1,-1, 1), vec3( 1,-1,-1),
  vec3(-1, 1,-1), vec3(-1, 1, 1), vec3( 1, 1, 1), vec3( 1, 1,-1),
];

var startingVertexColors = [
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 0.0, 1.0, 0.0, 1.0 ),
];

// colors
var vertexColors = [
    // Back yellow
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    
    // Front blue
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ), 
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),

    // Left orange
    vec4( 1.0, 0.5, 0.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 ),

    // Right white
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),

    // Bottom red
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 ),

    // Top green
    vec4( 0.0, 1.0, 0.0, 1.0 ), 
    vec4( 0.0, 1.0, 0.0, 1.0 ),
    vec4( 0.0, 1.0, 0.0, 1.0 ), 
    vec4( 0.0, 1.0, 0.0, 1.0 ),
];

var cubePosition = [[[[],[],[]],[[],[],[]],[[],[],[]]],[[[],[],[]],[[],[],[]],[[],[],[]]],[[[],[],[]],[[],[],[]],[[],[],[]]]]

// indices
var indices = [
    0,1,2,      0,2,3,    // front
    4,5,6,      4,6,7,    // back
    8,9,10,     8,10,11,  // left
    12,13,14,   12,14,15, // right
    16,17,18,   16,18,19, // bottom
    20,21,22,   20,22,23  // top
];

// moves
var moves = [
  "L","l","R","r","U","u",
  "D","d","F","f","B","b",
  "M","m","S","s","E","e"
]

function toDegree (rad) {
    return rad / Math.PI *180;
}

var strategies = {
    "L": ["L","F","R","B","L","F","R","B"],
    "R": ["R","B","L","F","R","B","L","F"],
    "U": ["D","D","D","D","U","U","U","U"],
    "D": ["U","U","U","U","D","D","D","D"],
    "F": ["B","L","F","R","F","R","B","L"],
    "B": ["F","R","B","L","B","L","F","R"],
    "M": ["M","S","m","s","M","S","m","s"],
    "E": ["e","e","e","e","E","E","E","E"],
    "S": ["s","M","S","m","S","m","s","M"],
    "l": ["l","f","r","b","l","f","r","b"],
    "r": ["r","b","l","f","r","b","l","f"],
    "u": ["d","d","d","d","u","u","u","u"],
    "d": ["u","u","u","u","d","d","d","d"],
    "f": ["b","l","f","r","f","r","b","l"],
    "b": ["f","r","b","l","b","l","f","r"],
    "m": ["m","s","M","S","m","s","M","S"],
    "e": ["E","E","E","E","e","e","e","e"],
    "s": ["S","m","s","M","s","M","S","m"]
}

function callPush(strategy) {
    var strat = strategies[strategy];
    if(animationQueue.length < 1000) {
      var theta = toDegree(THETA)%360;
      var phi = toDegree(PHI)%360;
      if ((phi >= -180 && phi < 0) || (phi >= 180 && phi < 360)) {
        if (theta < -315 || (theta >= -45 && theta < 45) || theta >= 315) {
          animationQueue.push(strat[0]);
        } else if ((theta >= -315 && theta < -225) || (theta >= 45 && theta < 135)) {
          animationQueue.push(strat[1]);
        } else if ((theta >= -225 && theta < -135) || (theta >=135 && theta < 225)) {
          animationQueue.push(strat[2]);
        } else if ((theta >= -135 && theta < -45) || (theta >= 215 && theta < 315)) {
          animationQueue.push(strat[3]);
        }
      } else {
        if (theta < -315 || (theta >= -45 && theta < 45) || theta >= 315) {
          animationQueue.push(strat[4]);
        } else if ((theta >= -315 && theta < -225) || (theta >= 45 && theta < 135)) {
          animationQueue.push(strat[5]);
        } else if ((theta >= -225 && theta < -135) || (theta >=135 && theta < 225)) {
          animationQueue.push(strat[6]);
        } else if ((theta >= -135 && theta < -45) || (theta >= 215 && theta < 315)) {
          animationQueue.push(strat[7]);
        }
      }
    } else {
      console.log("queue full!");
    }
  }

// init() function
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    document.onkeydown = function(event) {
        if(event.keyCode == 37) {   // left arrow
            THETA += 0.1;
        } else if(event.keyCode == 38) {    // up arrow
            PHI += 0.1;
        } else if(event.keyCode == 39) {    // right arrow
            THETA -= 0.1;
        } else if(event.keyCode == 40) {    // down arrow
            PHI -= 0.1;
        } else if(event.keyCode == 27) {    // ESC
            animationQueue = [];
            alert("queue emptied.")
        }
    }

    // mouse events
    var drag = false;
    var old_mouse_x, old_mouse_y;
    var isHeld = false;
    var mouseDown = function(e) {
        drag = true;
        old_mouse_x = e.pageX;
        old_mouse_y = e.pageY;
        e.preventDefault();
        return false;
    }

    var mouseUp = function(e) {drag = false;}

    var mouseMove = function(e) {
    if (!drag) {return false;}

    var dX = e.pageX - old_mouse_x;
    var dY = e.pageY - old_mouse_y;

    var absPhi = Math.abs(toDegree(PHI)%360);

    if (absPhi > 180.0 && absPhi < 270.0 || PHI < 0.0) {
        if (toDegree(PHI)%360 < -180.0) {
        up = vec3(0.0, 1.0, 0.0);
        THETA += -dX*2*Math.PI/canvas.width;
        } else {
        up = vec3(0.0, -1.0, 0.0);
        THETA += dX*2*Math.PI/canvas.width;
        }
    } else {
        if (absPhi > 270.0) {
        up = vec3(0.0, -1.0, 0.0);
        THETA += dX*2*Math.PI/canvas.width;
        } else {
        up = vec3(0.0, 1.0, 0.0);
        THETA += -dX*2*Math.PI/canvas.width;
        }
    }
    PHI += -dY*2*Math.PI/canvas.height;

    old_mouse_x = e.pageX;
    old_mouse_y = e.pageY;
    e.preventDefault();
    }

    var mouseWheel = function(e) {
        if (cameraRadius - e.wheelDelta/75 < cameraRadiusMinimum) {
            cameraRadius = cameraRadiusMinimum;
        } else if (cameraRadius - e.wheelDelta/75 > cameraRadiusMaximum) {
            cameraRadius = cameraRadiusMaximum;
        } else {
            cameraRadius -= e.wheelDelta/75;
        }
    }
    canvas.addEventListener("mousewheel", mouseWheel, false);
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    // button listeners setting up
    document.getElementById( "LButton" ).onclick = function () {callPush("L");};
    document.getElementById( "RButton" ).onclick = function () {callPush("R");};
    document.getElementById( "UButton" ).onclick = function () {callPush("U");};
    document.getElementById( "DButton" ).onclick = function () {callPush("D");};
    document.getElementById( "FButton" ).onclick = function () {callPush("F");};
    document.getElementById( "BButton" ).onclick = function () {callPush("B");};
    document.getElementById( "MButton" ).onclick = function () {callPush("M");};
    document.getElementById( "EButton" ).onclick = function () {callPush("E");};
    document.getElementById( "SButton" ).onclick = function () {callPush("S");};
    document.getElementById( "lButton" ).onclick = function () {callPush("l");};
    document.getElementById( "rButton" ).onclick = function () {callPush("r");};
    document.getElementById( "uButton" ).onclick = function () {callPush("u");};
    document.getElementById( "dButton" ).onclick = function () {callPush("d");};
    document.getElementById( "fButton" ).onclick = function () {callPush("f");};
    document.getElementById( "bButton" ).onclick = function () {callPush("b");};
    document.getElementById( "mButton" ).onclick = function () {callPush("m");};
    document.getElementById( "eButton" ).onclick = function () {callPush("e");};
    document.getElementById( "sButton" ).onclick = function () {callPush("s");};

    document.getElementById( "randomTurnCount").onkeypress = function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            randomizeMoves();
            return false;
        }
    }
    document.getElementById( "RandomButton" ).onclick = randomizeMoves;

    // files
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    document.getElementById( "LoadButton" ).onclick = function () {
        if (!fileLoaded) {
            alert("You have not selected a cube state file.");
        } else {
            cubePosition = cubePos.slice();
            PHI = phiValue;
            THETA = thetaValue;
            document.getElementById("files").value = "";
        }
    };

    document.getElementById("SaveButton").onclick = function() {
        saveAs(new Blob([JSON.stringify({ phi: PHI, thet: THETA, cubepos: cubePosition})], {type: "text/plain;"}), ("cube.txt"));
    };

    // Set up WebGL
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL is not available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.5);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // color array attribute buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
    gl.enableVertexAttribArray(vColor);

    // vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var _vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(_vPosition);

    // get locations of uniforms
    projectionMatrix = gl.getUniformLocation(program, "projectionMatrix");
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

    fillCubePositions();
    render();
}

function randomizeMoves() {
    var input = document.getElementById("randomTurnCount").value;
    if(isNaN(input) || !input) {
      alert("Invalid Input.");
    } else if (input > 1000 || input < 0) {
      alert("Range is from 0 - 1000.");
    } else if (animationQueue.length != 0) {
      alert("Animation queue not empty");
    } else {
      var rand;
      for (i = 0; i < input; i++) {
        rand = Math.round(17*Math.random());
        animationQueue.push(moves[rand]);
      }
    }
}

function handleFileSelect(e) {
    var files = e.target.files;
    var reader = new FileReader();
    f = files[0];

    reader.onload = (function(theFile) {
        fileLoaded = true;
        return function(e) {
            fileContent = JSON.parse(reader.result);
            phiValue = fileContent.phi;
            thetaValue = fileContent.thet;
            cubePos = fileContent.cubepos;
            var x, y, z;
            for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                for (z = 0; z < 3; z++) {
                cubePos[x][y][z][4].matrix = true;
                }
            }
        }
    }
    })(f);

    reader.readAsText(f);
}


var insideColor = vec4(0.0, 0.0, 0.0, 0.85);
function setInsideColor(x,y,z) {
  for (i = 0; i < vertexColors.length; i++) {
    vertexColors[i] = startingVertexColors[Math.floor(i/4)];
  }
  if (x != -1) {darken(8);}
  if (x != 1) {darken(12);}
  if (y != -1) {darken(16);}
  if (y != 1) {darken(20);}
  if (z != -1) {darken(0);}
  if (z != 1) {darken(4);}
  
  function darken(index) {
    for (i = index; i < index + 4; i++) {
      vertexColors[i] = insideColor;
    }  
  }
}

function checkSolved() {
  var orientation;
  for (i = 0; i < 3; i++) {
    for (j = 0; j < 3; j++) {
      orientation = cubePosition[0][0][0][3];
      for (x = -1; x < 2; x++) {
        for (y = -1; y < 2; y++) {
          for (z = -1; z < 2; z++) {
            if (cubePosition[x+1][y+1][z+1][3][i][j] != orientation[i][j]) {
              // Check center faces
              if (x == 0 && z == 0) {
                if (cubePosition[x+1][y+1][z+1][3][1][j] != orientation[1][j]) {
                  return false;
                }
              } else if (x == 0 && y == 0) {
                if (cubePosition[x+1][y+1][z+1][3][2][j] != orientation[2][j]) {
                  return false;
                }
              } else if (y == 0 && z == 0) {
                if (cubePosition[x+1][y+1][z+1][3][0][j] != orientation[0][j]) {
                  return false;
                }
              } else {
                return false;
              }
            }
          }
        }
      }
    }
  }
  return true;
}

function fillCubePositions() {
  for (i = -1; i < 2; i++) {
    for (j = -1; j < 2; j++) {
      for (k = -1; k < 2; k++) {
        cubePosition[i+1][j+1][k+1][0] = i;
        cubePosition[i+1][j+1][k+1][1] = j;
        cubePosition[i+1][j+1][k+1][2] = k;
        cubePosition[i+1][j+1][k+1][3] = [vec3(-1,0,0),vec3(0,-1,0),vec3(0,0,-1)];
        cubePosition[i+1][j+1][k+1][4] = mat4();
      }
    }
  }
}

function negateVec(vec) {
  var temp = [];
  for (i=0; i < vec.length; i++) {temp[i] = -vec[i];}
  return temp;
}
function getRotationAxes(x,y,z) {return cubePosition[x+1][y+1][z+1][3];}
function getRotationMatrix(x,y,z) {return cubePosition[x+1][y+1][z+1][4];}
function setRotationMatrix(x,y,z,m) {cubePosition[x+1][y+1][z+1][4] = m;}

var currentAngle = 0;
var interval;
var isAnimating = false;
var animationQueue = [];

function animate(action) {
  interval = setInterval(function() {callRotation(action);}, animationTimer);
}

function callRotation(face) {
  turnCubeFace(face);
  currentAngle += rotationAngle;
  if (currentAngle == 90) {
    clearInterval(interval);
    isAnimating = false;
    currentAngle = 0;
    turnFinished(face);
    if (checkSolved()) {
        setTimeout(function(){alert("Cube Solved");}, 100);
    }
  }
}

function turnFinished(face) {
  var x, y, z, temp;
  for (x = -1; x < 2; x++) {
    for (y = -1; y < 2; y++) {
      for (z = -1; z < 2; z++) {
        switch (face) {
         case "L":
          if (cubePosition[x+1][y+1][z+1][0] == -1) {
            temp = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][1];
            cubePosition[x+1][y+1][z+1][3][1] = negateVec(cubePosition[x+1][y+1][z+1][3][2]);
            cubePosition[x+1][y+1][z+1][3][2] = temp;
          }
          break;
         case "l":
          if (cubePosition[x+1][y+1][z+1][0] == -1) {
            temp = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][2];
            cubePosition[x+1][y+1][z+1][3][2] = negateVec(cubePosition[x+1][y+1][z+1][3][1]);
            cubePosition[x+1][y+1][z+1][3][1] = temp;
          }
          break;
         case "R":
          if (cubePosition[x+1][y+1][z+1][0] == 1) {
            temp = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][2];
            cubePosition[x+1][y+1][z+1][3][2] = negateVec(cubePosition[x+1][y+1][z+1][3][1]);
            cubePosition[x+1][y+1][z+1][3][1] = temp;
          }
          break;
         case "r":
          if (cubePosition[x+1][y+1][z+1][0] == 1) {
            temp = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = -temp;
            
            
            temp = cubePosition[x+1][y+1][z+1][3][1];
            cubePosition[x+1][y+1][z+1][3][1] = negateVec(cubePosition[x+1][y+1][z+1][3][2]);
            cubePosition[x+1][y+1][z+1][3][2] = temp;
          }
          break;
         case "U":
          if (cubePosition[x+1][y+1][z+1][1] == 1) {
            temp = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][0];
            cubePosition[x+1][y+1][z+1][3][0] = negateVec(cubePosition[x+1][y+1][z+1][3][2]);
            cubePosition[x+1][y+1][z+1][3][2] = temp;
          }
          break;
         case "u":
          if (cubePosition[x+1][y+1][z+1][1] == 1) {
            temp = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][2];
            cubePosition[x+1][y+1][z+1][3][2] = negateVec(cubePosition[x+1][y+1][z+1][3][0]);
            cubePosition[x+1][y+1][z+1][3][0] = temp;
          }
          break;
         case "D":
          if (cubePosition[x+1][y+1][z+1][1] == -1) {
            temp = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][2];
            cubePosition[x+1][y+1][z+1][3][2] = negateVec(cubePosition[x+1][y+1][z+1][3][0]);
            cubePosition[x+1][y+1][z+1][3][0] = temp;
          }
          break;
         case "d":
          if (cubePosition[x+1][y+1][z+1][1] == -1) {
            temp = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][0];
            cubePosition[x+1][y+1][z+1][3][0] = negateVec(cubePosition[x+1][y+1][z+1][3][2]);
            cubePosition[x+1][y+1][z+1][3][2] = temp;
          }
          break;
         case "E":
          if (cubePosition[x+1][y+1][z+1][1] == 0) {
            temp = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][2];
            cubePosition[x+1][y+1][z+1][3][2] = negateVec(cubePosition[x+1][y+1][z+1][3][0]);
            cubePosition[x+1][y+1][z+1][3][0] = temp;
          }
          break;
         case "e":
          if (cubePosition[x+1][y+1][z+1][1] == 0) {
            temp = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][0];
            cubePosition[x+1][y+1][z+1][3][0] = negateVec(cubePosition[x+1][y+1][z+1][3][2]);
            cubePosition[x+1][y+1][z+1][3][2] = temp;
          }
          break;
         case "F":
          if (cubePosition[x+1][y+1][z+1][2] == 1) {
            temp = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][1];
            cubePosition[x+1][y+1][z+1][3][1] = negateVec(cubePosition[x+1][y+1][z+1][3][0]);
            cubePosition[x+1][y+1][z+1][3][0] = temp;
          }
          break;
         case "f":
          if (cubePosition[x+1][y+1][z+1][2] == 1) {
            temp = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][0];
            cubePosition[x+1][y+1][z+1][3][0] = negateVec(cubePosition[x+1][y+1][z+1][3][1]);
            cubePosition[x+1][y+1][z+1][3][1] = temp;
          }
          break;
         case "S":
          if (cubePosition[x+1][y+1][z+1][2] == 0) {
            temp = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][1];
            cubePosition[x+1][y+1][z+1][3][1] = negateVec(cubePosition[x+1][y+1][z+1][3][0]);
            cubePosition[x+1][y+1][z+1][3][0] = temp;
          }
          break;
         case "s":
          if (cubePosition[x+1][y+1][z+1][2] == 0) {
            temp = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][0];
            cubePosition[x+1][y+1][z+1][3][0] = negateVec(cubePosition[x+1][y+1][z+1][3][1]);
            cubePosition[x+1][y+1][z+1][3][1] = temp;
          }
          break;
         case "B":
          if (cubePosition[x+1][y+1][z+1][2] == -1) {
            temp = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][0];
            cubePosition[x+1][y+1][z+1][3][0] = negateVec(cubePosition[x+1][y+1][z+1][3][1]);
            cubePosition[x+1][y+1][z+1][3][1] = temp;
          }
          break;
         case "b":
          if (cubePosition[x+1][y+1][z+1][2] == -1) {
            temp = cubePosition[x+1][y+1][z+1][0];
            cubePosition[x+1][y+1][z+1][0] = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][1];
            cubePosition[x+1][y+1][z+1][3][1] = negateVec(cubePosition[x+1][y+1][z+1][3][0]);
            cubePosition[x+1][y+1][z+1][3][0] = temp;
          }
          break;
         case "M":
          if (cubePosition[x+1][y+1][z+1][0] == 0) {
            temp = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][1];
            cubePosition[x+1][y+1][z+1][3][1] = negateVec(cubePosition[x+1][y+1][z+1][3][2]);
            cubePosition[x+1][y+1][z+1][3][2] = temp;
          }
          break;
         case "m":
          if (cubePosition[x+1][y+1][z+1][0] == 0) {
            temp = cubePosition[x+1][y+1][z+1][1];
            cubePosition[x+1][y+1][z+1][1] = cubePosition[x+1][y+1][z+1][2];
            cubePosition[x+1][y+1][z+1][2] = -temp;
            
            temp = cubePosition[x+1][y+1][z+1][3][2];
            cubePosition[x+1][y+1][z+1][3][2] = negateVec(cubePosition[x+1][y+1][z+1][3][1]);
            cubePosition[x+1][y+1][z+1][3][1] = temp;
          }
        }
      }
    }
  }
}

function turnCubeFace(face) {
  var x,y,z;
  var direction,value;
  var mainAxis,secondAxis,thirdAxis;
  var oldMatrix, newMatrix
  switch (face) {
   case "L":
    mainAxis = 0; value = -1; direction = "L";
    break;
   case "l":
    mainAxis = 0; value = -1; direction = 0;
    break;
   case "R":
    mainAxis = 0; value = 1; direction = 0;
    break;
   case "r":
    mainAxis = 0; value = 1; direction = "r";
    break;
   case "M":
    mainAxis = 0;value = 0;direction = "M";
    break;
   case "m":
    mainAxis = 0;value = 0;direction = 0;
    break;
   case "U":
    mainAxis = 1;value = 1;direction = 0;
    break;
   case "u":
    mainAxis = 1;value = 1;direction = "u";
    break;
   case "D":
    mainAxis = 1;value = -1;direction = "D";
    break;
   case "d":
    mainAxis = 1;value = -1;direction = 0;
    break;
   case "E":
    mainAxis = 1;value = 0;direction = "E";
    break;
   case "e":
    mainAxis = 1;value = 0;direction = 0;
    break;
   case "F":
    mainAxis = 2;value = 1;direction = 0;
    break;
   case "f":
    mainAxis = 2;value = 1;direction = "f";
    break;
   case "B":
    mainAxis = 2;value = -1;direction = "B";
    break;
   case "b":
    mainAxis = 2;value = -1;direction = 0;
    break;
   case "S":
    mainAxis = 2;value = 0;direction = 0;
    break;
   case "s":
    mainAxis = 2;value = 0;direction = "s";
    break;
  }
  for (x = -1; x < 2; x++) {
    for (y = -1; y < 2; y++) {
      for (z = -1; z < 2; z++) {
        if (cubePosition[x+1][y+1][z+1][mainAxis] == value) {
          oldMatrix = getRotationMatrix(x,y,z);
          if (!direction) {
            oldMatrix = mult(oldMatrix,rotate(rotationAngle,getRotationAxes(x,y,z)[mainAxis]));
          } else {
            oldMatrix = mult(oldMatrix,rotate(rotationAngle,negateVec(getRotationAxes(x,y,z)[mainAxis])));
          }
          setRotationMatrix(x,y,z,oldMatrix);
        }
      }
    }
  }
}
// render() function
function render() {
  if (animationQueue.length != 0 && !isAnimating) {
    animate(animationQueue.shift());
    isAnimating = true;
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Set the camera position
  eye = vec3(cameraRadius*Math.sin(PHI)*Math.sin(THETA), cameraRadius*Math.cos(PHI), cameraRadius*Math.sin(PHI)*Math.cos(THETA));
    
  PROJMATRIX = perspective(fovy, aspect, near, far);
  
  MVMATRIX = lookAt(eye, at, up);
  var x, y, z;
  for (x = -1; x <= 1; x++) {
    for (y = -1; y <= 1; y++) {
      for (z = -1; z <= 1; z++) {
        if (x !=0 || y !=0 || z!=0) {
          var tempMVMATRIX = MVMATRIX;
          
          MVMATRIX = mult(MVMATRIX,getRotationMatrix(x,y,z));
          MVMATRIX = mult(MVMATRIX,translate(vec3(x*spacing,y*spacing,z*spacing)));
          setInsideColor(x,y,z);
          
          cBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
          
          vColor = gl.getAttribLocation( program, "vColor" );
          gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
          gl.enableVertexAttribArray(vColor);
          
          gl.uniformMatrix4fv(projectionMatrix, false, flatten(PROJMATRIX));
          gl.uniformMatrix4fv(modelViewMatrix, false, flatten(MVMATRIX));
          gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
          
          MVMATRIX = tempMVMATRIX;
        }  
      }
    }
  }
  requestAnimFrame(render);
}