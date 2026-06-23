import assert from "node:assert/strict";

import {
  createInitialState,
  getRandomEmptyCell,
  queueDirection,
  stepGame,
} from "../src/gameLogic.js";

const tests = [
  {
    name: "snake moves one tile in the queued direction",
    run() {
      const initial = createInitialState(() => 0);
      const next = stepGame(initial, () => 0);

      assert.deepEqual(next.snake[0], {
        x: initial.snake[0].x + 1,
        y: initial.snake[0].y,
      });
      assert.equal(next.score, 0);
      assert.equal(next.status, "running");
    },
  },
  {
    name: "snake grows and score increases when eating food",
    run() {
      const initial = createInitialState(() => 0);
      const targetFood = { x: initial.snake[0].x + 1, y: initial.snake[0].y };
      const state = { ...initial, food: targetFood, status: "running" };

      const next = stepGame(state, () => 0);

      assert.equal(next.snake.length, state.snake.length + 1);
      assert.equal(next.score, 1);
      assert.notDeepEqual(next.food, targetFood);
    },
  },
  {
    name: "reversing direction is ignored for a snake longer than one segment",
    run() {
      const initial = createInitialState(() => 0);
      const pendingDirection = queueDirection(initial, "left");

      assert.equal(pendingDirection, initial.pendingDirection);
    },
  },
  {
    name: "collision with boundary ends the game",
    run() {
      const state = {
        ...createInitialState(() => 0),
        snake: [{ x: 15, y: 0 }],
        direction: "right",
        pendingDirection: "right",
        food: { x: 0, y: 0 },
        status: "running",
      };

      const next = stepGame(state, () => 0);

      assert.equal(next.status, "game-over");
    },
  },
  {
    name: "food placement avoids occupied snake cells",
    run() {
      const snake = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];

      const food = getRandomEmptyCell(snake, 4, () => 0);

      assert.deepEqual(food, { x: 3, y: 0 });
    },
  },
];

let passed = 0;

for (const test of tests) {
  try {
    test.run();
    passed += 1;
    console.log(`PASS: ${test.name}`);
  } catch (error) {
    console.error(`FAIL: ${test.name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

if (passed === tests.length) {
  console.log(`All ${passed} tests passed.`);
}
