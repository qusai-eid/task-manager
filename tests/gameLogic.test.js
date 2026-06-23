import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  getRandomEmptyCell,
  queueDirection,
  stepGame,
} from "../src/gameLogic.js";

test("snake moves one tile in the queued direction", () => {
  const initial = createInitialState(() => 0);
  const next = stepGame(initial, () => 0);

  assert.deepEqual(next.snake[0], { x: initial.snake[0].x + 1, y: initial.snake[0].y });
  assert.equal(next.score, 0);
  assert.equal(next.status, "running");
});

test("snake grows and score increases when eating food", () => {
  const initial = createInitialState(() => 0);
  const targetFood = { x: initial.snake[0].x + 1, y: initial.snake[0].y };
  const state = { ...initial, food: targetFood, status: "running" };

  const next = stepGame(state, () => 0);

  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, targetFood);
});

test("reversing direction is ignored for a snake longer than one segment", () => {
  const initial = createInitialState(() => 0);
  const pendingDirection = queueDirection(initial, "left");

  assert.equal(pendingDirection, initial.pendingDirection);
});

test("collision with boundary ends the game", () => {
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
});

test("food placement avoids occupied snake cells", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = getRandomEmptyCell(snake, 4, () => 0);

  assert.deepEqual(food, { x: 3, y: 0 });
});
