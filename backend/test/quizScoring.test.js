import test from "node:test";
import assert from "node:assert/strict";
import { gradeAnswers } from "../routes/quizRoutes.js";

test("scores valid numeric answer indexes", () => {
  const result = gradeAnswers({ q1: 1, q2: 1, q3: 0, q4: 0, q5: 1 });

  assert.equal(result.score, 5);
  assert.equal(result.results.length, 5);
  assert.ok(result.results.every(answer => answer.correct));
});

test("does not coerce strings, nulls, or booleans into answer indexes", () => {
  const result = gradeAnswers({ q1: "1", q2: null, q3: false, q4: 0.5, q5: 1 });

  assert.equal(result.score, 1);
  assert.equal(result.results[0].selectedAnswer, "Not answered");
  assert.equal(result.results[1].selectedAnswer, "Not answered");
  assert.equal(result.results[2].selectedAnswer, "Not answered");
  assert.equal(result.results[3].selectedAnswer, "Not answered");
  assert.equal(result.results[4].correct, true);
});

test("treats omitted and out-of-range answers as unanswered", () => {
  const result = gradeAnswers({ q3: 99 });

  assert.equal(result.score, 0);
  assert.equal(result.results[0].selectedAnswer, "Not answered");
  assert.equal(result.results[2].selectedAnswer, "Not answered");
});
