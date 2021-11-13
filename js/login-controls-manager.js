export default class LoginControlsManager {

  #button        = undefined; // HTMLButtonElement
  #usernameInput = undefined; // HTMLInputElement
  #passwordInput = undefined; // HTMLInputElement
  #roleSelect    = undefined; // HTMLSelectElement

  #lastUUID = null; // UUID

  // (Element, (String, String) => Unit) => LoginControlsManager
  constructor(joinForm, onLogIn) {

    this.#button        = joinForm.querySelector("#join-button");
    this.#usernameInput = joinForm.querySelector("#username"   );
    this.#passwordInput = joinForm.querySelector("#password"   );
    this.#roleSelect    = joinForm.querySelector("#role-select");

    joinForm.addEventListener("submit", () => {

      this.#button.disabled = true;

      const username = this. getUsername();
      const password = this.#getPassword();

      onLogIn(username, password);

    });

  }

  // () => String
  getUsername = () => {
    return this.#usernameInput.value;
  };

  // () => Unit
  join = () => {
    this.#button.click();
  };

  // (() => HTMLOptionElement) => (Session) => Unit
  onNewSelection = (createOption) => (session) => {

    const hasActive = session !== null;

    const isNewSelection = session?.oracleID !== this.#lastUUID;
    this.#lastUUID       = session?.oracleID;

    this.#passwordInput.disabled = !hasActive || !session.hasPassword;
    this.#button       .disabled = !hasActive;
    this.#roleSelect   .disabled = !hasActive;

    if (!hasActive || isNewSelection) {
      this.setPassword("");
    }

    this.#roleSelect.innerHTML = "";
    if (hasActive) {
      session.roleInfo.forEach(
        ([roleName, current, max]) => {
          const node        = createOption();
          const isUnlimited = max === 0;
          node.disabled     = !isUnlimited && current >= max;
          node.innerText    = isUnlimited ? `${roleName} | ${current}` : `${roleName} | ${current}/${max}`;
          node.value        = roleName;
          this.#roleSelect.appendChild(node);
        }
      );
    }

  };

  // () => Unit
  reset = () => {
    this.#button.disabled = false;
  };

  // (String) => Unit
  setUsername = (username) => {
    this.#usernameInput.value = username;
  };

  // (String) => Unit
  setPassword = (password) => {
    this.#passwordInput.value = password;
  };

  // () => String
  #getPassword = () => {
    return this.#passwordInput.value;
  };

}
