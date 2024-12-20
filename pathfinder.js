class Pathfinder {
  constructor(grid) {
    this.grid = grid;
    this.open = []; // Contains the nodes that need to be evaluated while solving
    this.closed = []; // Contains the nodes that have already been evaluated
    this.path = []; // Contains the path from start to end after retracing the path
  }

  async findPath(callback) {
    // The algorithm starts at the start node
    this.open.push(grid.startNode);

    // As long as there are nodes in the open list the algorithm is running
    // Nodes in the open list are bascically all unchecked nodes that you could get to from the starting point
    // So if there is a possible path, sooner or later the end node will end up in this array
    while (this.open.length > 0) {
      let current = this.getCurrentNode(); // Get the node with the lowest fCost to evaluate next

      this.open.splice(this.open.indexOf(current), 1); // Remove the current from the open array
      this.closed.push(current); // And add it to the closed array

      // Return condition of the loop:
      // If the current node is the end node the path has been found
      if (current.state === NODE_STATE.END) {
        this.retracePath(grid.startNode, grid.endNode, callback);
        return;
      }

      // Add the neighbouring nodes (Imagine it like a rubics cube around the current node)
      // to the open list so theyll get evaluated
      const neighbours = this.grid.getNeighbours(current);
      for (let i = 0; i < neighbours.length; i++) {
        const neighbour = neighbours[i];
        if (this.closed.includes(neighbour)) {
          // Dont add them if they have been checked already - otherwise infinte loop
          continue;
        }

        // Calculate the new gCost of the node
        // which is the distance from the start node to the current node + the distance from the current node to that neighbour
        let newGCost =
          current.g_cost + this.grid.getDistance(current, neighbour);

        // If the the neighbour is not in the open list
        // or the new gCost is lower than the current gCost, which means
        // it is a better path to get to the neighbour
        // then add it to the list
        if (newGCost < neighbour.g_cost || !this.open.includes(neighbour)) {
          neighbour.setGCost(newGCost);
          neighbour.setHCost(this.grid.getDistance(neighbour, grid.endNode));
          neighbour.parent = current;

          if (!this.open.includes(neighbour)) {
            this.open.push(neighbour);
          }
        }
        await this.delay();
      }
    }
    setTimeout(callback, RESET_DELAY);
  }

  // Retraces the final, shortest possible path by backtracking it through the solved nodes parents nodes
  retracePath(startNode, endNode, callback) {
    const path = [];
    let current = endNode;
    while (current !== startNode) {
      path.unshift(current);
      current = current.parent;
    }
    this.path = path;

    this.retrace(this.path);

    // After the path is retraced and the delay is over, execute the callback
    setTimeout(callback, this.path.length * SOLVE_DELAY + RESET_DELAY);
  }

  getCurrentNode() {
    // This function returns the node with the lowest fCost of the open nodes
    let current = this.open[0];
    for (let i = 1; i < this.open.length; i++) {
      const currentFCost = current.g_cost + current.h_cost;
      const nodeFCost = this.open[i].g_cost + this.open[i].h_cost;

      const fCostIsLower = nodeFCost < currentFCost;
      const fCostIsEqual = nodeFCost === currentFCost;
      const hCostIsLower = this.open[i].h_cost < current.h_cost;

      if (fCostIsLower || (fCostIsEqual && hCostIsLower)) {
        current = this.open[i];
      }
    }
    return current;
  }

  // This function delays the solving process
  // i could not use setTimeout so i had to use Promises which was very finnicky
  delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, SOLVE_DELAY);
    });
  }

  // Recursive function that updates the path state of the final path nodes
  retrace(arr) {
    if (arr.length === 0) {
      return;
    }

    setTimeout(() => {
      this.retrace(arr.slice(1));
      const node = arr[0];
      if (node.state !== NODE_STATE.END) {
        node.setState(NODE_STATE.PATH);
      }
    }, RETRACE_DELAY);
  }
}
