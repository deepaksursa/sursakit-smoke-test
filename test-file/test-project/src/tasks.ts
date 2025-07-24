import { boolean } from "zod";

const formDOM = document.querySelector<HTMLFormElement>(".form")!;
const listDOM = document.querySelector<HTMLUListElement>(".list")!;
const formInput = document.querySelector<HTMLInputElement>(".form-input")!;

type Task = {
  description: string;
  isCompleted: boolean;
};

const tasks: Task[] = loadTask();
renderTask(tasks);

function loadTask(): Task[] {
  const storedTask = localStorage.getItem("tasks");
  if (storedTask) {
    return JSON.parse(storedTask);
  } else {
    return [];
  }
}

formDOM.addEventListener("submit", function (e) {
  e.preventDefault();
  const taskDescription: string = formInput.value;
  if (taskDescription.trim() === "") {
    return alert("Task cannot be empty");
  }
  const task: Task = { description: taskDescription, isCompleted: false };
  // add task to list
  tasks.push(task);
  renderTask(tasks);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  formInput.value = "";
  return;
});

function renderTask(value: Task[]) {
  const taskListMarkUp = value
    .map((item, index) => {
      return `<li>${item.description}</li><input class="isCompleted" type=checkbox value=${item.isCompleted} data-id=${index}></input>`;
    })
    .join("");
  listDOM.innerHTML = taskListMarkUp;
  const listItemDOM =
    document.querySelectorAll<HTMLInputElement>(".isCompleted");
  listItemDOM.forEach((item) => {
    item.addEventListener("click", (e) => {
      console.log(e.currentTarget);
    });
  });
}
