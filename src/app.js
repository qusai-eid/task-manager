import {
  createInitialState,
  DEFAULT_TICK_MS,
  queueDirection,
  startRunning,
  stepGame,
  togglePause,
} from "./gameLogic.js";

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();
let tickHandle = null;

createBoard();
render();
syncLoop();

window.addEventListener("keydown", (event) => {
  const direction = getDirectionFromKey(event.key);

  if (direction) {
    event.preventDefault();
    state = {
      ...state,
      pendingDirection: queueDirection(state, direction),
    };
    state = startRunning(state);
    render();
    syncLoop();
    return;
  }

  if (event.key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    syncLoop();
    return;
  }

  if (event.key === "Enter" && state.status === "game-over") {
    restartGame();
  }
});

restartButton.addEventListener("click", restartGame);

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;
    state = {
      ...state,
      pendingDirection: queueDirection(state, direction),
    };
    state = startRunning(state);
    render();
    syncLoop();
  });
});

function createBoard() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < state.gridSize * state.gridSize; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.appendChild(cell);
  }
  boardElement.appendChild(fragment);
}

function render() {
  const cells = boardElement.children;
  const snakePositions = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const head = state.snake[0];

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const cell = cells[y * state.gridSize + x];
      const key = `${x},${y}`;
      cell.className = "cell";

      if (state.food && state.food.x === x && state.food.y === y) {
        cell.classList.add("food");
      }

      if (snakePositions.has(key)) {
        cell.classList.add("snake");
      }

      if (head.x === x && head.y === y) {
        cell.classList.add("head");
      }
    }
  }

  scoreElement.textContent = String(state.score);
  statusElement.textContent = getStatusText(state.status);
  restartButton.textContent = state.status === "game-over" ? "Restart Game" : "Restart";
}

function syncLoop() {
  if (tickHandle) {
    window.clearInterval(tickHandle);
    tickHandle = null;
  }

  if (state.status !== "running") {
    return;
  }

  tickHandle = window.setInterval(() => {
    state = stepGame(state);
    render();

    if (state.status !== "running") {
      syncLoop();
    }
  }, DEFAULT_TICK_MS);
}

function restartGame() {
  state = createInitialState();
  render();
  syncLoop();
}

function getDirectionFromKey(key) {
  const normalized = key.toLowerCase();
  const keyMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  return keyMap[normalized] || null;
}

function getStatusText(status) {
  if (status === "idle") {
    return "Press any arrow key or WASD to start.";
  }

  if (status === "paused") {
    return "Paused. Press space to resume.";
  }

  if (status === "game-over") {
    return "Game over. Press Enter or use restart.";
  }

  return "Collect food and avoid the walls and your tail.";
}
