import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPlan } from "../src/planner.js";

describe("createPlan", () => {
  it("splits a large task into editable planning sections", () => {
    const plan = createPlan("Запустить маленький онлайн-курс по нейросетям");

    assert.equal(plan.goal.title, "Цель");
    assert.match(plan.goal.text, /онлайн-курс/i);
    assert.equal(plan.materials.title, "Материалы");
    assert.equal(plan.firstSteps.items.length, 4);
    assert.equal(plan.risks.title, "Риски");
    assert.equal(plan.resultCheck.title, "Проверка результата");
  });

  it("uses a helpful fallback when the task is empty", () => {
    const plan = createPlan("");

    assert.match(plan.goal.text, /Опиши большую задачу/i);
    assert.equal(plan.firstSteps.items.length, 4);
  });
});
