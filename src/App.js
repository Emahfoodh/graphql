import { LoginFormComponent } from "./views/LoginComponent.js";
import { DashboardComponent } from "./views/DashboardComponent.js";

const RenderPage = () => {
  // Render the login section into the main element
  const mainElement = document.querySelector("main");
  if (mainElement === null) {
    throw new Error("Main element not found");
  }
  const token = sessionStorage.getItem("token");
  if (!token) {
    new LoginFormComponent(mainElement);
    return
  }
  new DashboardComponent(mainElement);
};

document.addEventListener("DOMContentLoaded", function () {
  // Render the login section into the main element
  RenderPage()
});
