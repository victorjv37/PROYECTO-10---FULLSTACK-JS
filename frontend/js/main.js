console.log("🚀 main.js cargado correctamente!");

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM cargado, inicializando app...");
  initializeApp();
});

function initializeApp() {
  console.log("🔧 Inicializando aplicación...");

  checkAuthentication();

  initializeNavigation();
  initializeTabs();
  initializeModals();
  initializeToasts();

  if (API.TokenManager.isValid()) {
    loadUserData();
  }

  console.log("Academia de Héroes U.A. - Aplicación inicializada");
}

function checkAuthentication() {
  const publicPages = ["index.html", "login.html", "register.html"];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (!API.TokenManager.isValid() && !publicPages.includes(currentPage)) {
    API.showToast("Debes iniciar sesión para acceder a esta página", "warning");
    API.redirectToLogin();
    return;
  }

  if (
    API.TokenManager.isValid() &&
    ["login.html", "register.html"].includes(currentPage)
  ) {
    API.redirectToDashboard();
    return;
  }
}

function initializeNavigation() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("active");
    });
  }

  highlightCurrentPage();
}

function initializeTabs() {
  const currentPath = window.location.pathname;
  const isIndexPage =
    currentPath === "/" ||
    currentPath === "/index.html" ||
    currentPath.endsWith("index.html") ||
    currentPath.includes("index.html");

  if (!isIndexPage) {
    console.log("No es página index, saltando tabs");
    return;
  }

  console.log("Inicializando sistema de pestañas...");

  setTimeout(() => {
    const tabLinks = document.querySelectorAll("[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    console.log("Tab links encontrados:", tabLinks.length);
    console.log("Tab contents encontrados:", tabContents.length);

    if (tabLinks.length === 0 || tabContents.length === 0) {
      console.error("No se encontraron elementos de tabs");
      return;
    }

    function showTab(targetTab) {
      console.log("Mostrando pestaña:", targetTab);

      tabContents.forEach((content) => {
        content.classList.remove("active");
      });

      tabLinks.forEach((link) => {
        link.classList.remove("active");
      });

      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add("active");
        console.log("Pestaña activada:", targetTab);
      } else {
        console.error(
          "No se encontró el contenido para la pestaña:",
          targetTab
        );
      }

      const activeLink = document.querySelector(`[data-tab="${targetTab}"]`);
      if (activeLink) {
        activeLink.classList.add("active");
        console.log("Link activado:", targetTab);
      }

      const mobileMenu = document.querySelector(".mobile-menu");
      if (mobileMenu) {
        mobileMenu.classList.remove("active");
      }
    }

    tabLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Tab clickeado:", this.getAttribute("data-tab"));
        const targetTab = this.getAttribute("data-tab");
        if (targetTab) {
          showTab(targetTab);

          history.pushState(null, null, `#${targetTab}`);
        }
      });
    });

    window.addEventListener("popstate", function () {
      const hash = window.location.hash.substring(1);
      if (hash && document.getElementById(hash)) {
        showTab(hash);
      } else {
        showTab("inicio");
      }
    });

    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
      showTab(initialHash);
    } else {
      showTab("inicio");
    }
  }, 100);
}

function highlightCurrentPage() {
  const currentPath = window.location.pathname;
  const isIndexPage =
    currentPath === "/" ||
    currentPath === "/index.html" ||
    currentPath.endsWith("index.html") ||
    currentPath.includes("index.html");

  if (isIndexPage) {
    return;
  }

  const currentPage = currentPath.split("/").pop();
  const navLinks = document.querySelectorAll(".navbar-link");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

function initializeModals() {
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      API.hideModal(e.target.id);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".modal.active");
      if (activeModal) {
        API.hideModal(activeModal.id);
      }
    }
  });

  document.querySelectorAll(".modal-close").forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        API.hideModal(modal.id);
      }
    });
  });
}

function initializeToasts() {
  console.log("Sistema de notificaciones inicializado");
}

async function loadUserData() {
  try {
    const response = await API.Auth.getProfile();
    if (response.success) {
      updateUserInterface(response.data);
    }
  } catch (error) {
    console.error("Error cargando datos del usuario:", error);
  }
}

function updateUserInterface(userData) {
  const userAvatars = document.querySelectorAll(".user-avatar");
  userAvatars.forEach((avatar) => {
    if (userData.avatar) {
      avatar.src = userData.avatar.startsWith("http")
        ? userData.avatar
        : `http://localhost:5000/uploads/${userData.avatar}`;
    } else {
      avatar.src = API.Utils.getDefaultAvatar(userData.nombre);
    }
    avatar.alt = userData.nombre;
  });

  const userNames = document.querySelectorAll(".user-name");
  userNames.forEach((name) => {
    name.textContent = userData.nombreHeroe || userData.nombre;
  });

  const userClasses = document.querySelectorAll(".user-class");
  userClasses.forEach((classElement) => {
    classElement.textContent = userData.clase;
  });

  const userLevels = document.querySelectorAll(".user-level");
  userLevels.forEach((level) => {
    level.textContent = `Lv. ${userData.nivel}`;
  });

  if (userData.rol === "profesor" || userData.rol === "admin") {
    document.querySelectorAll(".admin-only").forEach((el) => {
      el.style.display = "";
    });
  }

  window.currentUser = userData;
}

async function logout() {
  const confirmed = await API.showConfirmModal(
    "¿Estás seguro de que quieres cerrar sesión?"
  );
  if (confirmed) {
    API.Auth.logout();
    API.showToast("Sesión cerrada exitosamente", "success");
  }
}

function initializeInteractiveComponents() {
  initializeDropdowns();
  initializeAccordions();
  initializeTooltips();
}

function initializeDropdowns() {
  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.nextElementSibling;
      const isOpen = dropdown.classList.contains("show");

      document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        menu.classList.remove("show");
      });

      if (!isOpen) {
        dropdown.classList.add("show");
      }
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.remove("show");
    });
  });
}

function initializeAccordions() {
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", function () {
      const accordion = this.closest(".accordion-item");
      const content = accordion.querySelector(".accordion-content");
      const isOpen = accordion.classList.contains("active");

      const group = this.closest(".accordion-group");
      if (group) {
        group.querySelectorAll(".accordion-item").forEach((item) => {
          item.classList.remove("active");
        });
      }

      if (!isOpen) {
        accordion.classList.add("active");
      }
    });
  });
}

function initializeTooltips() {
  document.querySelectorAll("[data-tooltip]").forEach((element) => {
    element.addEventListener("mouseenter", function () {
      showTooltip(this);
    });

    element.addEventListener("mouseleave", function () {
      hideTooltip();
    });
  });
}

function showTooltip(element) {
  const tooltipText = element.getAttribute("data-tooltip");
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.textContent = tooltipText;

  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  tooltip.style.left =
    rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
  tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + "px";

  setTimeout(() => tooltip.classList.add("show"), 10);
}

function hideTooltip() {
  const tooltip = document.querySelector(".tooltip");
  if (tooltip) {
    tooltip.remove();
  }
}

function setupSearch(searchInput, itemsContainer, searchKey = "textContent") {
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const items = itemsContainer.querySelectorAll("[data-searchable]");

    items.forEach((item) => {
      const searchText =
        searchKey === "textContent"
          ? item.textContent.toLowerCase()
          : item.getAttribute(searchKey).toLowerCase();

      if (searchText.includes(searchTerm)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
}

function createStatChart(canvasId, data, options = {}) {
  console.log("Creando gráfico en:", canvasId, data, options);
}

function animateValue(element, start, end, duration = 1000) {
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const value = Math.floor(start + range * progress);
    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function isMobile() {
  return window.innerWidth <= 768;
}

function isTablet() {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
  return window.innerWidth > 1024;
}

const AppState = {
  currentUser: null,
  currentPage: null,
  isLoading: false,

  setUser(userData) {
    this.currentUser = userData;
    this.notifySubscribers("user", userData);
  },

  setLoading(isLoading) {
    this.isLoading = isLoading;
    this.notifySubscribers("loading", isLoading);
  },

  subscribers: {},

  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
  },

  notifySubscribers(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach((callback) => callback(data));
    }
  },
};

window.HeroApp = window.HeroApp || {};
window.HeroApp.Components = window.HeroApp.Components || {};

Object.assign(window.HeroApp, {
  initializeApp,
  logout,
  initializeInteractiveComponents,
  setupSearch,
  createStatChart,
  animateValue,
  isMobile,
  isTablet,
  isDesktop,
  AppState,
});

initializeInteractiveComponents();
