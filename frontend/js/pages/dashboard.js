document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    await loadUserProfile();
    await loadUpcomingTrainings();
    await loadTopRanking();
  } catch (error) {
    console.error("Error cargando dashboard:", error);
    API.showToast("Error al cargar los datos del dashboard", "error");
  }
}

async function loadUserProfile() {
  try {
    const response = await API.Auth.getProfile();
    console.log("Respuesta del perfil:", response);

    if (response.success && response.data) {
      const user = response.data;
      console.log("Datos del usuario:", user);

      window.currentUser = user;

      if (user.rol === "profesor" || user.rol === "admin") {
        document.querySelectorAll(".admin-only").forEach((el) => {
          el.style.display = "";
        });
      }

      updateUserStats(user);
      updateQuirkInfo(user.quirk);
      updateAbilitiesStats(user.estadisticas);
    } else {
      console.error("No se recibieron datos del usuario");
      API.showToast("Error al cargar los datos del perfil", "error");
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
    API.showToast(
      "Error al cargar los datos del perfil: " + error.message,
      "error"
    );
  }
}

function updateUserStats(user) {
  document.getElementById("userLevel").textContent = user.nivel;
  document.getElementById("userPoints").textContent =
    user.puntuacion.toLocaleString();
  document.getElementById("completedTrainings").textContent =
    user.entrenamientosAsistidos?.length || 0;

  const userLevels = document.querySelectorAll(".user-level");
  userLevels.forEach((level) => {
    level.textContent = `Lv. ${user.nivel}`;
  });

  const levelProgress = ((user.puntuacion % 100) / 100) * 100;
  document.getElementById("levelProgress").style.width = levelProgress + "%";

  document.getElementById("userRank").textContent = "#?";
}

function updateQuirkInfo(quirk) {
  if (quirk && quirk.nombre && quirk.descripcion && quirk.tipo) {
    document.getElementById("quirkName").textContent = quirk.nombre;
    document.getElementById("quirkDescription").textContent = quirk.descripcion;

    const quirkTypeElement = document.getElementById("quirkType");
    quirkTypeElement.textContent =
      quirk.tipo.charAt(0).toUpperCase() + quirk.tipo.slice(1);
    quirkTypeElement.className = `quirk-badge quirk-${quirk.tipo}`;
  } else {
    console.error("Datos de quirk incompletos:", quirk);
    document.getElementById("quirkName").textContent = "Quirk no definido";
    document.getElementById("quirkDescription").textContent =
      "No hay descripción disponible";
  }
}

function updateAbilitiesStats(stats) {
  const container = document.getElementById("abilitiesStats");

  if (!stats) {
    console.error("No se recibieron estadísticas");
    stats = {
      fuerza: 1,
      velocidad: 1,
      tecnica: 1,
      inteligencia: 1,
      cooperacion: 1,
    };
  }

  const abilities = [
    { key: "fuerza", label: "Fuerza", icon: "💪", color: "#ef4444" },
    { key: "velocidad", label: "Velocidad", icon: "💨", color: "#3b82f6" },
    { key: "tecnica", label: "Técnica", icon: "🎯", color: "#a855f7" },
    {
      key: "inteligencia",
      label: "Inteligencia",
      icon: "🧠",
      color: "#06b6d4",
    },
    { key: "cooperacion", label: "Cooperación", icon: "🤝", color: "#22c55e" },
  ];

  container.innerHTML = abilities
    .map(
      (ability) => `
        <div class="stat-item text-center">
          <div class="stat-circle ${
            ability.key
          }" style="background: linear-gradient(135deg, ${ability.color}, ${
        ability.color
      }99)">
            ${stats[ability.key] || 1}
          </div>
          <div class="stat-label">${ability.label}</div>
        </div>
      `
    )
    .join("");
}

async function loadUpcomingTrainings() {
  try {
    const response = await API.Training.getAll({
      limit: 3,
      ordenPor: "fechaHora",
      orden: "asc",
    });

    if (response.success) {
      displayUpcomingTrainings(response.data.entrenamientos);
    }
  } catch (error) {
    console.error("Error cargando entrenamientos:", error);
    document.getElementById("upcomingTrainings").innerHTML = `
      <div class="text-center py-8 text-muted">
        <p>No se pudieron cargar los entrenamientos</p>
      </div>
    `;
  }
}

function displayUpcomingTrainings(trainings) {
  const container = document.getElementById("upcomingTrainings");

  if (trainings.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-muted">
        <div class="text-4xl mb-2">🎯</div>
        <p>No hay entrenamientos próximos</p>
        <a href="trainings.html" class="btn btn-primary btn-sm mt-4">Explorar Entrenamientos</a>
      </div>
    `;
    return;
  }

  container.innerHTML = trainings
    .map(
      (training) => `
        <div class="training-preview p-4 rounded-lg bg-secondary border border-primary hover:border-deku-green transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="font-semibold mb-1">${training.titulo}</h4>
              <p class="text-sm text-muted mb-2">${training.descripcion.substring(
                0,
                100
              )}...</p>
              <div class="flex items-center gap-4 text-xs text-secondary">
                <span>📅 ${API.Utils.formatRelativeDate(
                  training.fechaHora
                )}</span>
                <span>📍 ${training.ubicacion}</span>
                <span>⏱️ ${API.Utils.formatDuration(training.duracion)}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="training-type ${
                training.tipo
              } text-xs px-2 py-1 rounded">${training.tipo}</span>
              <p class="text-sm text-muted mt-1">${
                training.numeroParticipantes
              }/${training.capacidadMaxima}</p>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

async function loadTopRanking() {
  try {
    const response = await API.Auth.getRanking(5);

    if (response.success) {
      displayTopRanking(response.data);
    }
  } catch (error) {
    console.error("Error cargando ranking:", error);
    document.getElementById("topRanking").innerHTML = `
      <div class="text-center py-8 text-muted">
        <p>No se pudo cargar el ranking</p>
      </div>
    `;
  }
}

function displayTopRanking(ranking) {
  const container = document.getElementById("topRanking");

  if (ranking.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-muted">
        <p>No hay datos de ranking disponibles</p>
      </div>
    `;
    return;
  }

  container.innerHTML = ranking
    .map(
      (student, index) => `
        <div class="ranking-row" style="grid-template-columns: auto 1fr auto auto;">
          <div class="rank-position">#${index + 1}</div>
          <div class="rank-student">
            <img src="${
              student.avatar
                ? `http://localhost:5000/uploads/${student.avatar}`
                : API.Utils.getDefaultAvatar(student.nombre)
            }" 
                 alt="${student.nombre}" class="rank-avatar">
            <div class="rank-info">
              <h4>${student.nombreHeroe || student.nombre}</h4>
              <p class="rank-class">${student.clase}</p>
            </div>
          </div>
          <div class="rank-level">Lv. ${student.nivel}</div>
          <div class="rank-points">${student.puntuacion.toLocaleString()} pts</div>
        </div>
      `
    )
    .join("");

  const currentUser = window.currentUser;
  if (currentUser) {
    const userPosition = ranking.findIndex(
      (student) => student._id === currentUser._id
    );
    if (userPosition !== -1) {
      document.getElementById("userRank").textContent = `#${userPosition + 1}`;
    }
  }
}
