import { createPlan } from "./planner.js";

const STORAGE_KEY = "task-planner-mini-app";

const examples = [
  "Запустить маленький онлайн-курс по нейросетям",
  "Собрать личный сайт-портфолио за неделю",
  "Подготовить переезд в другой город без хаоса"
];

const sectionOrder = ["goal", "materials", "firstSteps", "risks", "resultCheck"];

const taskInput = document.querySelector("#taskInput");
const buildPlanButton = document.querySelector("#buildPlanButton");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.querySelector("#copyButton");
const exampleList = document.querySelector("#exampleList");
const planGrid = document.querySelector("#planGrid");
const statusLine = document.querySelector("#statusLine");
const planTitle = document.querySelector("#planTitle");

let state = loadState() ?? {
  task: examples[0],
  plan: createPlan(examples[0])
};

renderExamples();
renderState();

buildPlanButton.addEventListener("click", () => {
  state = {
    task: taskInput.value,
    plan: createPlan(taskInput.value)
  };
  saveState();
  renderState("План обновлен. Теперь можно править любой блок вручную.");
});

clearButton.addEventListener("click", () => {
  taskInput.value = "";
  taskInput.focus();
  renderStatus("Поле очищено.");
});

copyButton.addEventListener("click", async () => {
  const text = formatPlanForCopy(state.plan);

  try {
    await navigator.clipboard.writeText(text);
    renderStatus("План скопирован.");
  } catch {
    renderStatus("Не получилось скопировать автоматически. Выдели текст в блоках вручную.");
  }
});

function renderExamples() {
  exampleList.innerHTML = "";

  examples.forEach((example) => {
    const button = document.createElement("button");
    button.className = "example-button";
    button.type = "button";
    button.textContent = example;
    button.addEventListener("click", () => {
      state = {
        task: example,
        plan: createPlan(example)
      };
      saveState();
      renderState("Пример загружен.");
    });

    exampleList.append(button);
  });
}

function renderState(message = "") {
  taskInput.value = state.task;
  planTitle.textContent = state.task.trim() ? state.task.trim() : "Разбор задачи";
  planGrid.innerHTML = "";

  sectionOrder.forEach((key, index) => {
    const section = state.plan[key];
    const article = document.createElement("article");
    article.className = "plan-card";

    const badge = document.createElement("span");
    badge.className = "step-badge";
    badge.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("h3");
    title.textContent = section.title;

    const textarea = document.createElement("textarea");
    textarea.className = "plan-editor";
    textarea.rows = key === "goal" ? 5 : 7;
    textarea.value = section.text ?? section.items.join("\n");
    textarea.addEventListener("input", () => {
      if ("text" in section) {
        section.text = textarea.value;
      } else {
        section.items = textarea.value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      saveState();
      renderStatus("Изменения сохранены в этом браузере.");
    });

    article.append(badge, title, textarea);
    planGrid.append(article);
  });

  renderStatus(message);
  saveState();
}

function renderStatus(message) {
  statusLine.textContent = message;
}

function formatPlanForCopy(plan) {
  return sectionOrder
    .map((key) => {
      const section = plan[key];
      const body = section.text ?? section.items.map((item) => `- ${item}`).join("\n");
      return `${section.title}\n${body}`;
    })
    .join("\n\n");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
