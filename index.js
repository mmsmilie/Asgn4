// Vertex shader program
const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV; // Add declaration for UV attribute
  varying vec2 v_UV;
  attribute vec3 a_Normal;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  varying vec4 v_VertPos;
  
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }
`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;         // Base color
  uniform sampler2D u_Sampler0;     // Dirt
  uniform sampler2D u_Sampler1;     // Grass
  uniform sampler2D u_Sampler2;     // Sky
  uniform sampler2D u_Sampler3;     // Sun
  uniform sampler2D u_Sampler4;     // Ground
  uniform int u_whichTexture;       // Choice of texture
  uniform vec3 u_lightPos;          // Light position
  uniform vec3 u_cameraPos;         // Camera position
  varying vec4 v_VertPos;
  uniform int u_lightOn;
  uniform int u_normalOn;
  void main() {
    if(u_whichTexture == 0){
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); // Normals Debug
    }else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler0, v_UV); // Dirt
    }else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler1, v_UV); // Grass
    }else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler2, v_UV); // Sky
    }else if (u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler3, v_UV); // Sun
    }else if (u_whichTexture == 5){
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    }else{
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red for Error
    }

    // Normals 
    if(u_normalOn == 1){
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); // Normals Debug 
    }

    vec3 lightVector = vec3(v_VertPos) - u_lightPos;
    float r = length(lightVector);

    // Radius Example
    // if(r<1.0){
    //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // }else if (r < 2.0){S
    //   gl_FragColor = vec4(0.0,1.0,0.0,1.0);
    // }

    // Light Falloff Example
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r), 1.0);

    // N dot L
    if (u_lightOn == 1){
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float NdotL = max(dot(N, L), 0.0);
    
      // Reflection
      vec3 R = reflect(-L, N);
    
      // Eye
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
    
      float specular = pow(max(dot(E, R), 0.0), 10.0);
    
      vec3 blueLightColor = vec3(0.0, 0.0, 0.4); // Blue light color
      vec3 diffuse = (vec3(gl_FragColor) * NdotL * 0.7) + (blueLightColor) * NdotL;
      vec3 ambient = (vec3(gl_FragColor) * 0.3); // Adding a bit of blue to ambient
    
      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    }
    
  }
`;

// Global Variables
let canvas;
let gl; 
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_normalOn;

let lightX = 0.0;
let lightY = 5.0;
let lightZ = 0.0;

let g_lightPos = [0.0, 0.0, 0.0];

let u_whichTexture;

var identityMatrix;

let camera;

let wHeld = false;
let aHeld = false;
let sHeld = false;
let dHeld = false;
let qHeld = false;
let eHeld = false;
let tHeld = false;
let gHeld = false;

let texture;
let texture1;
let texture2;
let texture3;

let objects = [];
let moving = [];
let placed = [];

let stats;

let selected_map;

let canvas_mdown = false;

let lastMouseX = null;
let lastMouseY = null;

let normals = 0;
let light = 1;

let g_start_time = performance.now() / 1000;
let g_seconds = performance.now() / 1000 - g_start_time;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) console.log("Failed to get the storage location of a_Position");
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) console.log("Failed to get the storage location of a_UV");
  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) console.log("Failed to get the storage location of a_Normal");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (u_FragColor < 0) console.log("Failed to get the storage location of u_FragColor");
  u_Size = gl.getUniformLocation(gl.program, "u_Size");
  if (u_Size < 0) console.log("Failed to get the storage location of u_Size");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (u_ModelMatrix < 0) console.log("Failed to get the storage location of u_ModelMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (u_ProjectionMatrix < 0) console.log("Failed to get the storage location of u_ProjectionMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (u_ViewMatrix < 0) console.log("Failed to get the storage location of u_ViewMatrix");
  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (u_whichTexture < 0) console.log("Failed to get the storage location of u_whichTexture");
  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (u_lightPos < 0) console.log("Failed to get the storage location of u_lightPos");
  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (u_cameraPos < 0) console.log("Failed to get the storage location of u_cameraPos");
  u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
  if (u_lightOn < 0) console.log("Failed to get the storage location of u_lightOn");
  u_normalOn = gl.getUniformLocation(gl.program, "u_normalOn");
  if (u_normalOn < 0) console.log("Failed to get the storage location of u_normalOn");
}

function addActionsFromHTML() {
  document.addEventListener('keydown', function(event) {
    //console.log("Keydown: " + event.key);
    switch (event.key) {
      case "w": wHeld = true; break;
      case "s": sHeld = true; break;
      case "a": aHeld = true; break;
      case "d": dHeld = true; break;
      case "q": qHeld = true; break;
      case "e": eHeld = true; break;
      case "t": tHeld = true; break;
      case "g": gHeld = true; break;
    }
  });

  document.addEventListener('keyup', function(event) {
    switch (event.key) {
      case "w": wHeld = false; break;
      case "s": sHeld = false; break;
      case "a": aHeld = false; break;
      case "d": dHeld = false; break;
      case "q": qHeld = false; break;
      case "e": eHeld = false; break;
      case "t": tHeld = false; break;
      case "g": gHeld = false; break;
    }
  });

  document.addEventListener('keypress', function(event) {
    switch (event.key) {
      case"c": addCube(); break;
      case"b": breakCube(); break;
    }
  });

  canvas.addEventListener("mousedown", function(event) {
    canvas_mdown = true;
    lastMouseX = event.offsetX;
    lastMouseY = event.offsetY;
  });

  canvas.addEventListener("mouseup", function(event) {
      canvas_mdown = false;
      lastMouseX = null;
      lastMouseY = null;
  })

  canvas.addEventListener("mousemove", function(event) {
      if (canvas_mdown) {
          const deltaX = event.offsetX - lastMouseX;
          const deltaY = event.offsetY - lastMouseY;
          camera.alpha = 3;
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
              if (deltaX > 0) {
                  camera.panRight();
              } else {
                  camera.panLeft();
              }
          } else {
              if (deltaY > 0) {
                  camera.panDown();
              } else {
                  camera.panUp();
              }
          }

          lastMouseX = event.offsetX;
          lastMouseY = event.offsetY;
          camera.alpha = 5;
      }
  });

  document.getElementById("lightX").addEventListener("input", function(event) {
    lightX = parseFloat(event.target.value);
  });
  
  document.getElementById("lightY").addEventListener("input", function(event) {
    lightY = parseFloat(event.target.value);
  });
  
  document.getElementById("lightZ").addEventListener("input", function(event) {
    lightZ = parseFloat(event.target.value);
  });
  
} 

function initTextures() {
  texture = gl.createTexture();
  texture1 = gl.createTexture();
  texture2 = gl.createTexture();
  texture3 = gl.createTexture();
  texture4 = gl.createTexture();

  var u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  var u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  var u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  var u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
  var u_Sampler4 = gl.getUniformLocation(gl.program, "u_Sampler4");

  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();
  var image5 = new Image();

  image1.onload = function() { loadTexture(texture, u_Sampler0, image1,0); };
  image2.onload = function() { loadTexture(texture1, u_Sampler1, image2,1); };
  image3.onload = function() { loadTexture(texture2, u_Sampler2, image3,2); };
  image4.onload = function() { loadTexture(texture3, u_Sampler3, image4,3); };
  image5.onload = function() { loadTexture(texture4, u_Sampler4, image5,4); };

  image1.src = 'dirt.png';
  image2.src = 'grass.png';
  image3.src = 'Sky.jpg';
  image4.src = 'sun.jpg';
  image5.src = 'earth8k.jpg';

  return true;
}

function loadTexture(texture, u_Sampler, image,texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  if(texUnit == 0){
    gl.activeTexture(gl.TEXTURE0);
  }else if(texUnit == 1){
    gl.activeTexture(gl.TEXTURE1);
  }else if(texUnit == 2){
    gl.activeTexture(gl.TEXTURE2);
  }else if (texUnit == 3){
    gl.activeTexture(gl.TEXTURE3);
  }else if (texUnit == 4){
    gl.activeTexture(gl.TEXTURE4);
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, texUnit); // Bind the texture unit index to the sampler uniform
}

function controls() {
  if(wHeld) {
    camera.moveForward();
  }

  if(aHeld) {
    camera.moveLeft();
  }

  if(sHeld) {
    camera.moveBackward();
  }

  if(dHeld) {
    camera.moveRight();
  }

  if(qHeld) {
    camera.panLeft();
  }

  if(eHeld) {
    camera.panRight();
  }

  if(tHeld){
    camera.panUp();
  }

  if(gHeld){
    camera.panDown();
  }
}

function renderScene() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  controls();
  updateAnimations();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye[0], camera.eye[1], camera.eye[2]);

  objects.forEach(object => {
    object.render(normals,light);
  })

  placed.forEach(object => {
    object.render(normals,light);
  })

  moving.forEach(object => {
    object.render(normals,light);
  })


}

function tick() {

  g_seconds = performance.now() / 1000 - g_start_time;

  stats.begin();
  renderScene();
  stats.end();
  requestAnimationFrame(tick);
}

function updateAnimations(){
  moving = [];
  g_lightPos[0] = Math.cos(g_seconds) * 10 + lightX;
  g_lightPos[1] = lightY;
  g_lightPos[2] = Math.sin(g_seconds) * 10 + lightZ;
  //console.log(g_lightPos);
  var sun = new Sphere();
  sun.setTextChoice(4);
  sun.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  sun.scale(0.5,0.5,0.5);
  sun.setRgba(1,1,0,1); // Yello Sun
  moving.push(sun);
}

function drawPillar(z,x,height) {
  if(height == 0) {
    return;
  }

  if (height < 0) {
    var cube = new Cube();
    cube.translate(x-16,-height,z-16);
    cube.setTextChoice(2);
    objects.push(cube);
  }

  for(var i = 0; i < height; i++) {
    var cube = new Cube();
    cube.translate(x-16,i,z-16);
    cube.setTextChoice(1);
    objects.push(cube);
  }
}

function makeWorld(size,map) {
  var size_of_world = size;

  g_lightPos = [0,size_of_world/4,0];

  // Add SkyBox
  var skyBox = new Cube();
  skyBox.translate(0,0,0);
  skyBox.setTextChoice(3);
  skyBox.scale(-size_of_world,-size_of_world,-size_of_world);
  objects.push(skyBox);

  var ground = new Cube();
  ground.translate(0,-1,0);
  ground.setTextChoice(1);
  ground.scale(size_of_world,1,size_of_world);
  objects.push(ground);

  var sun = new Sphere();
  sun.setTextChoice(4);
  sun.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  sun.scale(0.5,0.5,0.5);
  sun.setRgba(1,1,0,1); // Yello Sun
  moving.push(sun);

  var sphere = new Sphere();
  sphere.setTextChoice(5);
  sphere.scale(5,5,5);
  sphere.translate(0,2,0);
  objects.push(sphere);

  for(var i = 0; i < size_of_world; i++) {
    for(var j = 0; j < size_of_world; j++) {
      drawPillar(i,j,map[i][j]);
    }
  }
}

function addCube(){
  //console.log(" I HAVE SUSSTAINED GOD HOOD AND CREATED A FUCING CUBBE")

  var x = Math.round(camera.eye.elements[0]);
  var y = Math.round(camera.eye.elements[1]);
  var z = Math.round(camera.eye.elements[2]);

  var cube = new Cube();
  cube.setTextChoice(2);
  cube.translate(x,y,z);

  placed.push(cube);
}

function breakCube(){
  var x = Math.round(camera.eye.elements[0]);
  var y = Math.round(camera.eye.elements[1]);
  var z = Math.round(camera.eye.elements[2]);

  for(var i = 0; i < placed.length; i++) {
    var cube = placed[i];
    var matrix = cube.matrix;
    if(Math.round(matrix.elements[12]) == x && Math.round(matrix.elements[13]) == y && Math.round(matrix.elements[14]) == z) {
      placed.splice(i,1);
    }
  }
}

function toggleNormals(){
  if (normals == 1){
    normals = 0;
  }else if(normals == 0){
    normals = 1;
  }
}

function toggleLight(){
  if (light == 1){
    light = 0;
  }else if(light == 0){
    light = 1;
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsFromHTML();

  camera = new Camera(canvas);

  identityMatrix = new Matrix4();

  selected_map = map_0;

  makeWorld(32,selected_map);

  stats = new Stats();
  stats.dom.style.left = "auto";
  stats.dom.style.right = 0;
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  // Set clear color
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  initTextures();

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.enable(gl.DEPTH_TEST);

  requestAnimationFrame(tick);
}
