import { API_ENDPOINTS } from "./Config.js";

export class AuthManager {
  /**
   * Logs in a user.
   * @param {String} username - The username.
   * @param {String} password - The password.
   * @returns
   */
  async login(username, password) {
    const credentials = btoa(`${username}:${password}`); // Base64 encode credentials
    const response = await fetch(API_ENDPOINTS.SIGNIN, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to login");
    }
    sessionStorage.setItem("authToken", data);
  }

  getToken() {
    return sessionStorage.getItem("authToken");
  }

  /**
   * Logs out the user by removing the token from local storage.
   */
  logout() {
    sessionStorage.removeItem("authToken");
  }
}
