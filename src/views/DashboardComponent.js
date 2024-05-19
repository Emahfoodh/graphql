import { AuthManager } from "../utils/Auth.js";
import { fetchGraphQL } from "../utils/FetchGraphql.js";
import { USER_PROFILE_QUERY } from "../utils/Query.js";
import { LoginFormComponent } from "./LoginComponent.js";

const dashboardSectionHTML = `
<section id="dashboardSection">
    <h2>Dashboard</h2>
    <div id="userProfile"></div>
    <button id="logoutButton">Logout</button>
</section>`;

export class DashboardComponent {
  /**
   *
   * @param {HTMLElement} parentElement
   */
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.userProfile = null;
    // this.logoutButton = null;
    this.authManager = new AuthManager();
    this.init();
  }

  init() {
    const parser = new DOMParser();
    const dashboardSectionParsed = parser.parseFromString(
      dashboardSectionHTML,
      "text/html"
    );

    this.userProfile = dashboardSectionParsed.querySelector("#userProfile");
    const logoutButton = dashboardSectionParsed.querySelector("#logoutButton");

    const dashboardSection = dashboardSectionParsed.querySelector("#dashboardSection");

    if (dashboardSection === null) {
      throw new Error("Dashboard section not found");
    }
    this.parentElement.appendChild(dashboardSection);

    // @ts-ignore
    logoutButton.addEventListener("click", this.handleLogout.bind(this));

    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
        const token = this.authManager.getToken();
        if (!token) {
          throw new Error("Token not found");
        }
        const data = await fetchGraphQL(USER_PROFILE_QUERY, token);
        const user = data.user;
        // @ts-ignore
        this.userProfile.innerHTML = `
          <p>Username: ${user.username}</p>
          <p>XP: ${user.xp}</p>
          <p>Grades: ${user.grades}</p>
          <p>Audits: ${user.audits}</p>
          <p>Skills: ${user.skills}</p>
        `;
      } catch (error) {
        // @ts-ignore
        this.userProfile.innerHTML = `<p style="color: red;">Failed to load profile information: ${error.message}</p>`;
      }
  }

  handleLogout() {
    this.authManager.logout();
    this.parentElement.innerHTML = ""; // Clear the dashboard content
    new LoginFormComponent(this.parentElement); // Show the login form again
  }
}
