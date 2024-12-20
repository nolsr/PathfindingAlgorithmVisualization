class Grid {
  constructor(size, callback) {
    this.size = size; // x, y, z of the grid 3d array
    this.pathfinder = new Pathfinder(this);
    this.startNode = null;
    this.endNode = null;
    this.callback = callback; // function to be executed after path was solved
    this.colors = null;

    // Initialize 3d array
    this.grid = new Array(size.x);
    for (let i = 0; i < size.x; i++) {
      this.grid[i] = new Array(size.y);

      for (let j = 0; j < size.y; j++) {
        this.grid[i][j] = new Array(size.z);
      }
    }

    this.setColors(); // Get random color scheme from constants
    this.fillGrid(); // Fill the grid array with nodes
  }

  setColors() {
    const randomIndex = Math.floor(Math.random() * COLOR_SCHEMES.length); // Getting a random index from the colors
    const colorValues = COLOR_SCHEMES[randomIndex];

    // Casting the values to the p5js color function
    // This is needed because the p5js library is not loaded yet when
    // the constants are assigned in the constants.js file. Thats why i couldnt
    // just assign the "color(r,g,b)" values directly in constants.js
    this.colors = {
      bg: color(...colorValues.bg),
      finalPathColor: color(...colorValues.finalPathColor),
      regularNodeColor: color(...colorValues.regularNodeColor),
      algorithmWorkingColor: color(...colorValues.algorithmWorkingColor),
    };
  }

  setNode(x, y, z, state) {
    this.grid[x][y][z].setState(state);
    return this.grid[x][y][z];
  }

  fillGrid() {
    // Initially fill the grid with free nodes
    for (let x = 0; x < this.size.x; x++) {
      for (let y = 0; y < this.size.y; y++) {
        for (let z = 0; z < this.size.z; z++) {
          this.grid[x][y][z] = new Node({ x, y, z }, NODE_STATE.FREE);
        }
      }
    }

    // Generate walls (white space)
    this.generateRandomWalls();

    // Random Start and end node positions
    const startX = Math.floor(Math.random() * this.size.x);
    const startY = Math.floor(Math.random() * this.size.y);
    const startZ = Math.floor(Math.random() * this.size.z);

    const endX = Math.floor(Math.random() * this.size.x);
    const endY = Math.floor(Math.random() * this.size.y);
    const endZ = Math.floor(Math.random() * this.size.z);

    this.startNode = this.setNode(startX, startY, startZ, NODE_STATE.START);
    this.endNode = this.setNode(endX, endY, endZ, NODE_STATE.END);
  }

  draw() {
    // These variables are needed to center the grid in the canvas
    const totalX = this.size.x * (NODE_WIDTH + NODE_MARGIN * 2);
    const totalY = this.size.y * (NODE_WIDTH + NODE_MARGIN * 2);
    const totalZ = this.size.z * (NODE_WIDTH + NODE_MARGIN * 2);
    const offsetX = totalX / 2;
    const offsetZ = totalZ / 2;
    const maxCost = this.grid // this is used for mapping the color of the nodes that are being evaluated
      .flat()
      .flat()
      .reduce(
        // flat() turns the 3d grid array into a 2d array and then from 2d into a regular array
        (max, node) => Math.max(max, node.g_cost), // Callback function that returns the larger value of the current node and the current maximum
        0 // Initial Value
      );

    translate(-offsetX, CAMERA_HEIGHT, -offsetZ); // Starting position to draw the grid: "bottom left corner"

    // Move to the center point of the first sphere to be drawn
    translate(-NODE_MARGIN - NODE_WIDTH / 2, 0, -NODE_MARGIN - NODE_WIDTH / 2);
    for (let x = 0; x < this.size.x; x++) {
      translate(NODE_WIDTH + NODE_MARGIN * 2, 0, 0); // Move to the next row position
      for (let y = 0; y < this.size.y; y++) {
        translate(0, -1 * (NODE_WIDTH + NODE_MARGIN * 2), 0); // Move to the next column position
        for (let z = 0; z < this.size.z; z++) {
          translate(0, 0, NODE_WIDTH + NODE_MARGIN * 2); // Move to the next layer position
          if (this.grid[x][y][z].state == NODE_STATE.WALL) continue;

          fill(this.getFillColor(this.grid[x][y][z], maxCost));
          sphere(NODE_WIDTH / 2); // Draw the node
        }
        translate(0, 0, -totalZ); // Move back to the previous layer position
      }
      translate(0, totalY, 0); // Move back to the previous column position
    }
  }

  getFillColor(node, maxCost) {
    switch (node.state) {
      case NODE_STATE.FREE:
        const nodeIsUntouched = node.g_cost == 0;

        // differentiate between "stale" nodes and nodes that are being, or have been evaluated
        if (nodeIsUntouched) {
          return this.colors.regularNodeColor;
        } else {
          // if the nde has been evaluated before, map the color of the node to a value between 0 and 1
          const amount = map(node.g_cost, 0, maxCost, 0, 1);
          // Then use this mapped value to lerp the color between the regular node color and the color of the algorithm
          const color = lerpColor(
            this.colors.regularNodeColor,
            this.colors.algorithmWorkingColor,
            amount
          );
          return color;
        }

      case NODE_STATE.PATH:
      case NODE_STATE.START:
      case NODE_STATE.END:
        return this.colors.finalPathColor;
    }
    return color(0, 0, 0); // Just in case something really weird happens and the node has no state, i want it to not crash so i just return black
  }

  getNode(x, y, z) {
    return this.grid[x][y][z];
  }

  getNeighbours(node) {
    // Just returns all the neighbours in 3d space that are not walls, so maximum of 26
    let neighbours = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const outOfBounds =
            node.gridPos.x + x < 0 ||
            node.gridPos.x + x >= this.size.x ||
            node.gridPos.y + y < 0 ||
            node.gridPos.y + y >= this.size.y ||
            node.gridPos.z + z < 0 ||
            node.gridPos.z + z >= this.size.z;
          const isSelf = x == 0 && y == 0 && z == 0;

          if (isSelf || outOfBounds) {
            continue;
          }

          let neighbour = this.getNode(
            node.gridPos.x + x,
            node.gridPos.y + y,
            node.gridPos.z + z
          );

          if (neighbour.state != NODE_STATE.WALL) {
            neighbours.push(neighbour);
          }
        }
      }
    }
    return neighbours;
  }

  getDistance(nodeA, nodeB) {
    // Calculate the distance in each dimension
    let distX = Math.abs(nodeA.gridPos.x - nodeB.gridPos.x);
    let distY = Math.abs(nodeA.gridPos.y - nodeB.gridPos.y);
    let distZ = Math.abs(nodeA.gridPos.z - nodeB.gridPos.z);

    // Find the largest, middle, and smallest distances
    let largest = Math.max(distX, distY, distZ);
    let smallest = Math.min(distX, distY, distZ);
    let middle = distX + distY + distZ - largest - smallest;

    // Calculate the weighted distance
    let diagonal3D = 17 * smallest; // Cost for moving diagonally in 3D (x, y, z)
    let diagonal2D = 14 * (middle - smallest); // Cost for moving diagonally in 2D (x, y)
    let straight = 10 * (largest - middle); // Cost for straight movement in a single axis

    // Return the total cost
    return diagonal3D + diagonal2D + straight;
  }

  solve() {
    setTimeout(() => {
      this.pathfinder.findPath(this.callback);
    }, RESET_DELAY); // Applying the delay before the grid is solved
  }

  generateRandomWalls() {
    // Im basically taking out spherical chunks out of my 3d Grid

    const sphereCount = Math.floor(
      this.size.x * this.size.y * this.size.z * 0.1
    ); // Number of spheres
    const maxRadius = Math.floor(
      Math.min(this.size.x, this.size.y, this.size.z) / 2.5
    ); // Maximum radius of spheres

    for (let i = 0; i < sphereCount; i++) {
      // Random center for the sphere
      const centerX = Math.floor(Math.random() * this.size.x);
      const centerY = Math.floor(Math.random() * this.size.y);
      const centerZ = Math.floor(Math.random() * this.size.z);

      const radius = Math.floor(Math.random() * (maxRadius - 2)) + 2; // Radius between 2 and maxRadius

      for (let x = 0; x < this.size.x; x++) {
        for (let y = 0; y < this.size.y; y++) {
          for (let z = 0; z < this.size.z; z++) {
            const distance = Math.sqrt(
              Math.pow(x - centerX, 2) +
                Math.pow(y - centerY, 2) +
                Math.pow(z - centerZ, 2)
            );
            if (distance <= radius) {
              // Every node in the radius from the center location is "erased"
              this.grid[x][y][z].state = NODE_STATE.WALL;
            }
          }
        }
      }
    }
  }
}
