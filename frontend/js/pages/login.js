(function () {
  let loginForm;
  let loginButton;
  let passwordInput;

  document.addEventListener("DOMContentLoaded", () => {
    loginForm = document.getElementById("loginForm");
    loginButton = document.getElementById("loginBtn");
    passwordInput = document.getElementById("password");

    window.HeroApp?.Components?.renderNavbar({
      variant: "auth",
      action: "register",
    });

    if (!loginForm || !loginButton || !passwordInput) {
      return;
    }

    attachEventListeners();
    focusEmailField();
  });

  function attachEventListeners() {
    const togglePassword = document.getElementById("togglePassword");
    const quickLoginButtons = document.querySelectorAll("[data-quick-login]");

    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.getAttribute("type") === "password";
        passwordInput.setAttribute("type", isPassword ? "text" : "password");
        togglePassword.textContent = isPassword ? "🙈" : "👁️";
      });
    }

    quickLoginButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const email = button.dataset.email;
        const password = button.dataset.password;

        if (!email || !password) return;

        loginForm.email.value = email;
        loginForm.password.value = password;
        await handleLogin({ email, password });
      });
    });

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!API.validateForm(loginForm)) return;

      const formData = new FormData(loginForm);
      const credentials = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      await handleLogin(credentials);
    });
  }

  async function handleLogin(credentials) {
    setLoadingState(true);

    try {
      const response = await API.Auth.login(credentials);

      if (response.success) {
        API.showToast(response.message, "success");
        if (window.HeroApp?.AppState && response.data?.estudiante) {
          window.HeroApp.AppState.setUser(response.data.estudiante);
        }

        setTimeout(() => {
          API.redirectToDashboard();
        }, 1000);
        return;
      }

      API.showToast(response.message || "No se pudo iniciar sesión", "error");
    } catch (error) {
      console.error("Error en login:", error);
      const message =
        error instanceof API.ApiError
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo nuevamente.";

      API.showToast(message, "error");
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(isLoading) {
    const loginText = loginButton.querySelector(".login-text");
    const loginLoading = loginButton.querySelector(".login-loading");

    if (isLoading) {
      loginText?.classList.add("hidden");
      loginLoading?.classList.remove("hidden");
      loginButton.disabled = true;
    } else {
      loginText?.classList.remove("hidden");
      loginLoading?.classList.add("hidden");
      loginButton.disabled = false;
    }
  }

  function focusEmailField() {
    loginForm.querySelector('[name="email"]')?.focus();
  }
})();
