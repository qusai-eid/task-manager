export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const DEFAULT_TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(random = Math.random) {
  const center = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: getRandomEmptyCell(snake, GRID_SIZE, random),
    score: 0,
    status: "idle",
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state.pendingDirection;
  }

  const current = state.direction;
  if (state.snake.length > 1 && OPPOSITE_DIRECTIONS[current] === nextDirection) {
    return state.pendingDirection;
  }

  return nextDirection;
}

export function stepGame(state, random = Math.random) {
  if (state.status === "game-over") {
    return state;
  }

  const direction = state.pendingDirection;
  const nextHead = movePoint(state.snake[0], direction);
  const ateFood = pointsEqual(nextHead, state.food);
  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  if (hitsBoundary(nextHead, state.gridSize) || hitsSelf(nextHead, nextSnake.slice(1))) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      status: "game-over",
    };
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: ateFood ? getRandomEmptyCell(nextSnake, state.gridSize, random) : state.food,
    score: ateFood ? state.score + 1 : state.score,
    status: "running",
  };
}

export function togglePause(state) {
  if (state.status === "idle") {
    return {
      ...state,
      status: "running",
    };
  }

  if (state.status === "running") {
    return {
      ...state,
      status: "paused",
    };
  }

  if (state.status === "paused") {
    return {
      ...state,
      status: "running",
    };
  }

  return state;
}

export function startRunning(state) {
  if (state.status === "idle") {
    return {
      ...state,
      status: "running",
    };
  }

  return state;
}

export function getRandomEmptyCell(snake, gridSize, random = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(random() * available.length);
  return available[index];
}

function movePoint(point, direction) {
  const vector = DIRECTION_VECTORS[direction];
  return {
    x: point.x + vector.x,
    y: point.y + vector.y,
  };
}

function hitsBoundary(point, gridSize) {
  return point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;
}

function hitsSelf(head, body) {
  return body.some((segment) => pointsEqual(segment, head));
}

function pointsEqual(a, b) {
  return Boolean(a && b) && a.x === b.x && a.y === b.y;
}
