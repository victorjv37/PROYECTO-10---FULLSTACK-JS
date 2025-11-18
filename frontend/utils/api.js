const API_BASE_URL = "http://localhost:5000/api";

class ApiError extends Error {
  constructor(
    message,
    { status = 0, code = null, details = null, payload = null } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.payload = payload;
  }
}

const TokenManager = {
  get() {
    return localStorage.getItem("heroToken");
  },

  set(token) {
    localStorage.setItem("heroToken", token);
  },

  remove() {
    localStorage.removeItem("heroToken");
  },

  isValid() {
    const token = this.get();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

function parseResponseBody(response) {
  return response
    .text()
    .then((text) => {
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn("No se pudo parsear la respuesta JSON:", parseError);
        return { raw: text };
      }
    })
    .catch((error) => {
      console.warn("Error obteniendo el cuerpo de la respuesta:", error);
      return {};
    });
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = TokenManager.get();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token && TokenManager.isValid()) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  try {
    const response = await fetch(url, config);
    const data = await parseResponseBody(response);

    if (response.status === 401) {
      TokenManager.remove();
      showToast(
        "Sesión expirada. Por favor, inicia sesión nuevamente.",
        "error"
      );
      redirectToLogin();
      throw new ApiError("Sesión expirada", { status: 401, payload: data });
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Error en la petición (código ${response.status})`;
      throw new ApiError(message, {
        status: response.status,
        code: data?.code,
        details: data?.errors || data?.details || null,
        payload: data,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Error en API:", error);
    throw new ApiError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.",
      { status: error?.status || 0 }
    );
  }
}

const AuthAPI = {
  async register(studentData) {
    const response = await apiFetch("/auth/registro", {
      method: "POST",
      body: JSON.stringify(studentData),
    });

    if (response.success && response.data?.token) {
      TokenManager.set(response.data.token);
    }

    return response;
  },

  async login(credentials) {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data.token) {
      TokenManager.set(response.data.token);
    }

    return response;
  },

  logout() {
    TokenManager.remove();
    redirectToLogin();
  },

  async getProfile() {
    return await apiFetch("/auth/perfil");
  },

  async updateProfile(profileData, avatar = null) {
    const formData = new FormData();

    Object.keys(profileData).forEach((key) => {
      if (typeof profileData[key] === "object") {
        formData.append(key, JSON.stringify(profileData[key]));
      } else {
        formData.append(key, profileData[key]);
      }
    });

    if (avatar) {
      formData.append("avatar", avatar);
    }

    return await apiFetch("/auth/perfil", {
      method: "PUT",
      body: formData,
    });
  },

  async getRanking(limit = 10, clase = null) {
    const params = new URLSearchParams({ limite: limit });
    if (clase) params.append("clase", clase);

    return await apiFetch(`/auth/ranking?${params}`);
  },
};

const TrainingAPI = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    return await apiFetch(`/entrenamientos?${params}`);
  },

  async getById(id) {
    return await apiFetch(`/entrenamientos/${id}`);
  },

  async create(trainingData, image = null) {
    const formData = new FormData();

    Object.keys(trainingData).forEach((key) => {
      if (typeof trainingData[key] === "object") {
        formData.append(key, JSON.stringify(trainingData[key]));
      } else {
        formData.append(key, trainingData[key]);
      }
    });

    if (image) {
      formData.append("imagen", image);
    }

    return await apiFetch("/entrenamientos", {
      method: "POST",
      body: formData,
    });
  },

  async enroll(id) {
    return await apiFetch(`/entrenamientos/${id}/inscribirse`, {
      method: "POST",
    });
  },

  async unenroll(id) {
    return await apiFetch(`/entrenamientos/${id}/inscribirse`, {
      method: "DELETE",
    });
  },

  async complete(id, results = {}) {
    return await apiFetch(`/entrenamientos/${id}/completar`, {
      method: "POST",
      body: JSON.stringify({ resultados: results }),
    });
  },

  async getStatistics() {
    return await apiFetch("/entrenamientos/estadisticas");
  },

  async update(id, trainingData) {
    const formData = new FormData();

    Object.keys(trainingData).forEach((key) => {
      if (key === "imagen" && trainingData[key] instanceof File) {
        formData.append(key, trainingData[key]);
      } else if (
        typeof trainingData[key] === "object" &&
        trainingData[key] !== null
      ) {
        formData.append(key, JSON.stringify(trainingData[key]));
      } else if (
        trainingData[key] !== null &&
        trainingData[key] !== undefined
      ) {
        formData.append(key, trainingData[key]);
      }
    });

    return await apiFetch(`/entrenamientos/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  async removeAttendees(id, attendeeIds) {
    return await apiFetch(`/entrenamientos/${id}/asistentes`, {
      method: "DELETE",
      body: JSON.stringify({ attendeeIds }),
    });
  },
};

const Utils = {
  formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  },

  formatRelativeDate(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (date - now) / (1000 * 60 * 60);

    if (diffInHours < 0) {
      return "Ya pasó";
    } else if (diffInHours < 24) {
      return `En ${Math.ceil(diffInHours)} horas`;
    } else {
      const days = Math.ceil(diffInHours / 24);
      return `En ${days} días`;
    }
  },

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  },

  getQuirkColor(type) {
    const colors = {
      emision: "var(--deku-green-primary)",
      transformacion: "var(--ofa-blue-primary)",
      mutacion: "var(--warning-yellow)",
    };
    return colors[type] || "var(--text-muted)";
  },

  getTrainingTypeColor(type) {
    const colors = {
      combate: "#ef4444",
      rescate: "var(--ofa-blue-light)",
      "quirk-development": "#a855f7",
      resistencia: "var(--warning-yellow)",
      estrategia: "#06b6d4",
      "trabajo-en-equipo": "var(--deku-green-light)",
      "mision-practica": "#f87171",
    };
    return colors[type] || "var(--text-muted)";
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  getDefaultAvatar(name) {
    const initial = name.charAt(0).toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="60" fill="var(--deku-green-primary)"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${initial}</text>
      </svg>
    `)}`;
  },
};

function showToast(message, type = "info", duration = 5000) {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="toast-icon">
        ${getToastIcon(type)}
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };
  return icons[type] || icons.info;
}

function redirectToLogin() {
  window.location.href = "/pages/login.html";
}

function redirectToDashboard() {
  window.location.href = "/pages/dashboard.html";
}

function showLoading(element, text = "Cargando...") {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  element.innerHTML = `
    <div class="flex items-center justify-center gap-2 p-4">
      <div class="spinner"></div>
      <span>${text}</span>
    </div>
  `;
}

function hideLoading(element, originalContent = "") {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  element.innerHTML = originalContent;
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function showConfirmModal(message) {
  return new Promise((resolve) => {
    let modal = document.getElementById("bakugoConfirmModal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "bakugoConfirmModal";
      modal.className = "modal-confirm";
      modal.innerHTML = `
        <div class="modal-confirm-overlay"></div>
        <div class="modal-confirm-content">
          <div class="modal-confirm-image">
            <img src="/assets/foto-bakugo-preguntando.jpeg" alt="Bakugo">
          </div>
          <div class="modal-confirm-body">
            <h3 class="modal-confirm-title">¡Espera un momento! 💥</h3>
            <p class="modal-confirm-message"></p>
            <div class="modal-confirm-actions">
              <button class="btn btn-primary modal-confirm-yes">Sí, adelante</button>
              <button class="btn btn-outline modal-confirm-no">No, cancelar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const style = document.createElement("style");
      style.textContent = `
        .modal-confirm {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .modal-confirm.active {
          display: flex;
        }

        .modal-confirm-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .modal-confirm-content {
          position: relative;
          display: flex;
          background: var(--bg-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-2xl);
          max-width: 600px;
          width: 90%;
          overflow: hidden;
          border: 3px solid var(--danger-red);
          animation: modalBounce 0.3s ease-out;
        }

        @keyframes modalBounce {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-confirm-image {
          flex-shrink: 0;
          width: 200px;
          height: auto;
          overflow: hidden;
        }

        .modal-confirm-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-confirm-body {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .modal-confirm-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--danger-red);
          margin-bottom: 1rem;
        }

        .modal-confirm-message {
          font-size: 1.125rem;
          color: var(--text-primary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .modal-confirm-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .modal-confirm-yes {
          background: var(--danger-red) !important;
          border-color: var(--danger-red) !important;
        }

        .modal-confirm-yes:hover {
          background: #c0392b !important;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .modal-confirm-content {
            flex-direction: column;
            max-width: 90%;
          }

          .modal-confirm-image {
            width: 100%;
            height: 200px;
          }

          .modal-confirm-body {
            padding: 1.5rem;
          }

          .modal-confirm-actions {
            flex-direction: column;
          }

          .modal-confirm-actions button {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }

    modal.querySelector(".modal-confirm-message").textContent = message;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    const yesBtn = modal.querySelector(".modal-confirm-yes");
    const noBtn = modal.querySelector(".modal-confirm-no");
    const overlay = modal.querySelector(".modal-confirm-overlay");

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      yesBtn.onclick = null;
      noBtn.onclick = null;
      overlay.onclick = null;
    };

    yesBtn.onclick = () => {
      closeModal();
      resolve(true);
    };

    noBtn.onclick = () => {
      closeModal();
      resolve(false);
    };

    overlay.onclick = () => {
      closeModal();
      resolve(false);
    };
  });
}

function validateForm(formElement) {
  const inputs = formElement.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    const errorElement = input.parentElement.querySelector(".form-error");

    if (!input.value.trim()) {
      showFieldError(input, "Este campo es obligatorio");
      isValid = false;
    } else if (input.type === "email" && !Utils.isValidEmail(input.value)) {
      showFieldError(input, "Email inválido");
      isValid = false;
    } else {
      hideFieldError(input);
    }
  });

  return isValid;
}

function showFieldError(input, message) {
  input.classList.add("error");
  let errorElement = input.parentElement.querySelector(".form-error");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "form-error";
    input.parentElement.appendChild(errorElement);
  }

  errorElement.textContent = message;
}

function hideFieldError(input) {
  input.classList.remove("error");
  const errorElement = input.parentElement.querySelector(".form-error");
  if (errorElement) {
    errorElement.remove();
  }
}

window.API = {
  Auth: AuthAPI,
  Training: TrainingAPI,
  Utils,
  TokenManager,
  ApiError,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  hideModal,
  showConfirmModal,
  validateForm,
  showFieldError,
  hideFieldError,
  redirectToLogin,
  redirectToDashboard,
};
