import { AuthManager } from "../utils/Auth.js";
import { DashboardComponent } from "./DashboardComponent.js";

const loginSectionHTML = `
<section id="loginSection">
    <!-- Login form -->
    <h2>Login</h2>
    <form id="loginForm">
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Login</button>
        <p id="loginError" style="color: red;"></p>
    </form>
</section>`;

export class LoginFormComponent {
  /**
   *
   * @param {HTMLElement} parentElement
   */
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.usernameInput = null;
    this.passwordInput = null;
    this.loginSection = null;
    this.loginError = null;
    this.authManager = new AuthManager();
    this.init();
  }

  init() {
    const parser = new DOMParser();
    const loginSectionparced = parser.parseFromString(
      loginSectionHTML,
      "text/html"
    );

    const loginForm = loginSectionparced.querySelector("#loginForm");
    this.loginError = loginSectionparced.querySelector("#loginError");
    this.usernameInput = loginSectionparced.querySelector("#username");
    this.passwordInput = loginSectionparced.querySelector("#password");

    this.loginSection = loginSectionparced.querySelector("#loginSection");

    if (this.loginSection === null) {
      throw new Error("Login section not found");
    }
    this.parentElement.appendChild(this.loginSection);
    if (loginForm === null) {
      throw new Error("Login form not found");
    }
    loginForm.addEventListener("submit", this.handleSubmit.bind(this));
  }

  /**
   *
   * @param {Event} event
   */
  async handleSubmit(event) {
    event.preventDefault(); // @ts-ignore
    const username = this.usernameInput.value; // @ts-ignore
    const password = this.passwordInput.value;

    try {
      await this.authManager.login(username, password);

      //@ts-ignore Hide login section and show profile section
      this.loginSection.style.display = "none";

      //@ts-ignore Clear login error message
      this.loginError.textContent = "";

      new DashboardComponent(this.parentElement);
    } catch (error) {
      //@ts-ignore Display error message
      this.loginError.textContent = error.message;
    }
  }
}
