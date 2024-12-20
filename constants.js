const FPS_COUNT = 60;
const NODE_WIDTH = 40;
const NODE_MARGIN = 10;
const CAMERA_HEIGHT = 300;
const SOLVE_DELAY = 40; // Delay between each solving step
const RETRACE_DELAY = 5; // Delay between each final path lighting ab
const RESET_DELAY = 1000; // Delay before starting to solve and before generating a new grid

const NODE_STATE = {
  FREE: "free",
  WALL: "wall",
  START: "start",
  END: "end",
  PATH: "path",
};

const COLOR_SCHEMES = [
  // Used to apply different color schemes values are [r, g, b]
  {
    bg: [228, 230, 195],
    finalPathColor: [215, 255, 169],
    regularNodeColor: [137, 152, 120],
    algorithmWorkingColor: [247, 247, 247],
  },
  {
    bg: [91, 35, 51],
    finalPathColor: [255],
    regularNodeColor: [67, 77, 74],
    algorithmWorkingColor: [242, 67, 51],
  },
  {
    bg: [61, 84, 103],
    finalPathColor: [219, 84, 97],
    regularNodeColor: [241, 237, 238],
    algorithmWorkingColor: [138, 162, 158],
  },
  {
    bg: [31, 34, 50],
    finalPathColor: [253, 232, 233],
    regularNodeColor: [89, 100, 117],
    algorithmWorkingColor: [188, 158, 193],
  },
  {
    bg: [104, 83, 77],
    regularNodeColor: [129, 114, 106],
    finalPathColor: [255],
    algorithmWorkingColor: [244, 254, 193],
  },
  {
    bg: [32, 30, 31],
    regularNodeColor: [254, 239, 221],
    finalPathColor: [255, 64, 0],
    algorithmWorkingColor: [80, 178, 192],
  },
  {
    bg: [53, 61, 47],
    regularNodeColor: [107, 163, 104],
    finalPathColor: [220, 240, 252],
    algorithmWorkingColor: [220, 240, 252],
  },
  {
    bg: [41, 47, 54],
    regularNodeColor: [225],
    finalPathColor: [255, 107, 107],
    algorithmWorkingColor: [78, 205, 196],
  },
  {
    bg: [76, 59, 77],
    regularNodeColor: [165, 56, 96],
    finalPathColor: [97, 201, 168],
    algorithmWorkingColor: [173, 168, 182],
  },
  {
    bg: [30, 26, 29],
    regularNodeColor: [127, 83, 75],
    finalPathColor: [244],
    algorithmWorkingColor: [244, 184, 96],
  },
];
