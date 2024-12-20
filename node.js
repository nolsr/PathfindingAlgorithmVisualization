class Node {
  constructor(gridPos, state) {
    this.gridPos = gridPos; // {x, y, z}
    this.state = state; // NODE_STATE
    this.g_cost = 0; // Cost to get to this node
    this.h_cost = 0; // Cost to get from this node to the goal
    this.parent = null; // This is used for retraing later
  }

  setState(state) {
    this.state = state;
  }

  setGCost(g_cost) {
    this.g_cost = g_cost;
  }

  setHCost(h_cost) {
    this.h_cost = h_cost;
  }

  setParent(parent) {
    this.parent = parent;
  }
}
