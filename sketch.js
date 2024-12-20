let grid;
let camera;

let backgroundColor = 25;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setFrameRate(FPS_COUNT);

  initializeCamera();
  noStroke();

  grid = new Grid({ x: 5, y: 5, z: 5 }, resetGrid); // Provide the callback function to create a new grid after this one is solved
  grid.solve(); // Start the solving process

  // Sometimes there is not a solution due to how the grid is generated and the "walls"/whitespace
  // is created. Thats why sometimes a new grid is created without anything happening.
  // Thats when the starting point is surrounded by whitespace and no new neighbours can be found
}

function draw() {
  background(grid.colors.bg);
  orbitControl();
  moveCamera();
  drawLight();

  grid.draw();
}

function resetGrid() {
  // Create a new grid to solve
  const x = Math.floor(Math.random() * 9 + 3);
  const y = Math.floor(Math.random() * 9 + 3);
  const z = Math.floor(Math.random() * 6 + 3);
  grid = new Grid({ x, y, z }, resetGrid);
  grid.solve();
}

function drawLight() {
  ambientLight(180);
  directionalLight(200, 200, 200, 3, 5, 1);
  directionalLight(200, 200, 200, 2, 3, 4);
}

function initializeCamera() {
  camera = createCamera();
}

function moveCamera() {
  rotateY(millis() * 0.00005);
}
