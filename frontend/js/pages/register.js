(function () {
  let currentStep = 1;
  let registerForm;
  let registerButton;
  let stepIndicators;

  document.addEventListener("DOMContentLoaded", () => {
    registerForm = document.getElementById("registerForm");
    registerButton = document.getElementById("registerBtn");

    window.HeroApp?.Components?.renderNavbar({
      variant: "auth",
      action: "login",
    });

    if (!registerForm || !registerButton) return;

    stepIndicators = Array.from(
      document.querySelectorAll(".progress-steps .step")
    );

    attachStepHandlers();
    attachFormHandlers();
    focusFirstField();
  });

  function attachStepHandlers() {
    document
      .querySelectorAll("[data-step-next]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          goToStep(Number(button.dataset.stepNext))
        )
      );

    document
      .querySelectorAll("[data-step-prev]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          goToStep(Number(button.dataset.stepPrev))
        )
      );
  }

  function attachFormHandlers() {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearServerErrors();

      if (!validateCurrentStep() || !API.validateForm(registerForm)) {
        return;
      }

      const formData = new FormData(registerForm);
      const studentData = {
        nombre: formData.get("nombre"),
        nombreHeroe: formData.get("nombreHeroe") || null,
        email: formData.get("email"),
        password: formData.get("password"),
        quirk: {
          nombre: formData.get("quirkNombre"),
          descripcion: formData.get("quirkDescripcion"),
          tipo: formData.get("quirkTipo"),
        },
        clase: formData.get("clase"),
        rol: formData.get("rol") || "estudiante",
      };

      await handleRegister(studentData);
    });
  }

  async function handleRegister(studentData) {
    setLoadingState(true);

    try {
      const response = await API.Auth.register(studentData);

      if (response.success) {
        API.showToast(response.message, "success");

        if (window.HeroApp?.AppState) {
          window.HeroApp.AppState.setUser(response.data.estudiante);
        }

        setTimeout(() => {
          API.redirectToDashboard();
        }, 1200);
        return;
      }

      API.showToast(
        response.message || "No se pudo completar el registro",
        "error"
      );
    } catch (error) {
      console.error("Error en registro:", error);
      const message =
        error instanceof API.ApiError
          ? error.message
          : "No se pudo completar el registro";

      API.showToast(message, "error");
      highlightServerErrors(error);
    } finally {
      setLoadingState(false);
    }
  }

  function highlightServerErrors(error) {
    if (!error || !(error instanceof API.ApiError)) return;

    if (Array.isArray(error.details) && error.details.length > 0) {
      error.details.forEach((detail) => {
        const fieldName = detail.param || detail.field || detail.path;
        if (!fieldName) return;

        const input = registerForm.querySelector(`[name="${fieldName}"]`);
        if (!input) return;

        API.showFieldError(
          input,
          detail.msg || detail.message || "Dato inválido"
        );
      });

      API.showToast(
        error.details[0]?.msg ||
          error.details[0]?.message ||
          "Revisa los campos marcados en el formulario.",
        "warning"
      );
    }
  }

  function clearServerErrors() {
    registerForm
      .querySelectorAll(".form-error")
      .forEach((errorEl) => errorEl.remove());

    registerForm
      .querySelectorAll(".error")
      .forEach((input) => input.classList.remove("error"));
  }

  function goToStep(step) {
    if (Number.isNaN(step) || step === currentStep) return;
    if (step > currentStep && !validateCurrentStep()) return;

    showStep(step);
  }

  function showStep(step) {
    currentStep = step;

    document.querySelectorAll(".form-step").forEach((stepEl) => {
      stepEl.classList.toggle(
        "hidden",
        stepEl.getAttribute("data-step-id") !== String(step)
      );
    });

    stepIndicators.forEach((indicator) => {
      const indicatorStep = Number(indicator.dataset.step);
      indicator.classList.toggle("active", indicatorStep === step);
      indicator.classList.toggle("completed", indicatorStep < step);
    });
  }

  function validateCurrentStep() {
    const currentStepEl = document.querySelector(
      `.form-step[data-step-id="${currentStep}"]`
    );

    if (!currentStepEl) return true;

    const requiredInputs = currentStepEl.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );

    let isValid = true;

    requiredInputs.forEach((input) => {
      const value = input.value.trim();
      if (!value) {
        input.classList.add("border-danger");
        isValid = false;
      } else {
        input.classList.remove("border-danger");
      }
    });

    if (!isValid) {
      API.showToast(
        "Por favor completa todos los campos requeridos",
        "warning"
      );
    }

    return isValid;
  }

  function setLoadingState(isLoading) {
    const registerText = registerButton.querySelector(".register-text");
    const registerLoading = registerButton.querySelector(".register-loading");

    if (isLoading) {
      registerText?.classList.add("hidden");
      registerLoading?.classList.remove("hidden");
      registerButton.disabled = true;
    } else {
      registerText?.classList.remove("hidden");
      registerLoading?.classList.add("hidden");
      registerButton.disabled = false;
    }
  }

  function focusFirstField() {
    registerForm.querySelector('[name="nombre"]')?.focus();
  }
})();
