(function () {
  const LOCATION_INFO = getLocationInfo();

  const VARIANTS = {
    guest: buildGuestNavbar,
    auth: buildAuthNavbar,
    private: buildPrivateNavbar,
  };

  function renderNavbar({
    containerId = "app-header",
    variant = "guest",
    currentPage = "",
    action,
  } = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const builder = VARIANTS[variant] || VARIANTS.guest;
    container.innerHTML = builder({ currentPage, action });

    attachCommonInteractions(container);
    highlightCurrentPage(container, currentPage);
  }

  function buildGuestNavbar() {
    const { assetPrefix, pagePrefix } = LOCATION_INFO;

    return `
      <nav class="navbar">
        <div class="container">
          <div class="flex items-center justify-between">
            <a href="${pagePrefix}/index.html" class="navbar-brand">
              <img src="${assetPrefix}/assets/gif almyght.gif" alt="All Might" class="navbar-brand-icon">
              U.A. HIGH SCHOOL
            </a>
            <div class="flex items-center gap-4">
              <a href="${pagePrefix}/pages/login.html" class="btn btn-outline btn-sm">Iniciar Sesión</a>
              <a href="${pagePrefix}/pages/register.html" class="btn btn-primary btn-sm">Registrarse</a>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  function buildAuthNavbar({ action } = {}) {
    const { assetPrefix, pagePrefix } = LOCATION_INFO;

    const actionConfig = getAuthActionConfig(action);

    return `
      <nav class="navbar">
        <div class="container">
          <div class="flex items-center justify-between">
            <a href="${pagePrefix}/index.html" class="navbar-brand">
              <img src="${assetPrefix}/assets/gif almyght.gif" alt="All Might" class="navbar-brand-icon">
              U.A. HIGH SCHOOL
            </a>
            <div class="flex items-center gap-4">
              <a href="${pagePrefix}/index.html" class="navbar-link">Volver al Inicio</a>
              <a href="${actionConfig.href}" class="btn ${actionConfig.buttonClass} btn-sm">${actionConfig.label}</a>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  function buildPrivateNavbar({ currentPage } = {}) {
    const { assetPrefix, pagePrefix } = LOCATION_INFO;
    const links = [
      {
        label: "Dashboard",
        href: `${pagePrefix}/pages/dashboard.html`,
        page: "dashboard",
      },
      {
        label: "Entrenamientos",
        href: `${pagePrefix}/pages/trainings.html`,
        page: "trainings",
      },
      {
        label: "Ranking",
        href: `${pagePrefix}/pages/ranking.html`,
        page: "ranking",
      },
      {
        label: "Admin",
        href: `${pagePrefix}/pages/admin.html`,
        page: "admin",
        extraClass: "admin-only",
        hidden: true,
      },
      {
        label: "Mi Perfil",
        href: `${pagePrefix}/pages/profile.html`,
        page: "profile",
      },
    ];

    const navLinks = links
      .map((link) => {
        const extraClass = link.extraClass ? ` ${link.extraClass}` : "";
        const hiddenStyle = link.hidden ? ` style="display: none;"` : "";
        return `
          <li${hiddenStyle}>
            <a 
              href="${link.href}" 
              class="navbar-link${extraClass}" 
              data-page="${link.page}"
            >
              ${link.label}
            </a>
          </li>
        `;
      })
      .join("");

    return `
      <nav class="navbar">
        <div class="container">
          <div class="flex items-center justify-between">
            <a href="${pagePrefix}/pages/dashboard.html" class="navbar-brand">
              <img src="${assetPrefix}/assets/gif almyght.gif" alt="All Might" class="navbar-brand-icon">
              U.A. HIGH SCHOOL
            </a>
            <button class="mobile-menu-toggle" aria-label="Abrir menú">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
            <ul class="navbar-nav">
              ${navLinks}
            </ul>
            <div class="flex items-center gap-4">
              <div class="user-info hidden md:flex items-center gap-2">
                <img src="" alt="Avatar" class="user-avatar">
                <span class="user-name text-sm font-medium">Cargando...</span>
                <span class="badge badge-primary user-level">Lv. --</span>
              </div>
              <button class="btn btn-ghost btn-sm" data-action="logout">
                🚪 Salir
              </button>
            </div>
          </div>
          <div class="mobile-menu">
            <ul class="navbar-nav">
              ${navLinks}
            </ul>
            <div class="mt-4 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <img src="" alt="Avatar" class="user-avatar">
                <div>
                  <p class="user-name text-sm font-medium">Cargando...</p>
                  <span class="badge badge-primary user-level">Lv. --</span>
                </div>
              </div>
              <button class="btn btn-ghost btn-sm" data-action="logout">
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  function attachCommonInteractions(container) {
    const toggle = container.querySelector(".mobile-menu-toggle");
    const mobileMenu = container.querySelector(".mobile-menu");

    if (toggle && mobileMenu) {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
        mobileMenu.classList.toggle("active");
      });
    }

    container.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        if (typeof window.HeroApp?.logout === "function") {
          await window.HeroApp.logout();
        }
      });
    });
  }

  function highlightCurrentPage(container, currentPage) {
    if (!currentPage) return;
    container
      .querySelectorAll(`.navbar-link[data-page="${currentPage}"]`)
      .forEach((link) => link.classList.add("active"));
  }

  function getAuthActionConfig(action) {
    const { pagePrefix } = LOCATION_INFO;

    if (action === "login") {
      return {
        href: `${pagePrefix}/pages/login.html`,
        label: "Iniciar Sesión",
        buttonClass: "btn-outline",
      };
    }

    return {
      href: `${pagePrefix}/pages/register.html`,
      label: "Registrarse",
      buttonClass: "btn-primary",
    };
  }

  function getLocationInfo() {
    const path = window.location.pathname || "/";
    const inPagesDirectory = path.includes("/pages/");

    return {
      assetPrefix: inPagesDirectory ? ".." : ".",
      pagePrefix: inPagesDirectory ? ".." : ".",
    };
  }

  window.HeroApp = window.HeroApp || {};
  window.HeroApp.Components = window.HeroApp.Components || {};
  window.HeroApp.Components.renderNavbar = renderNavbar;
})();
