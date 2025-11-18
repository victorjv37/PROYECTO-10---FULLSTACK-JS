# Academia de Héroes U.A.

Aplicación fullstack inspirada en _My Hero Academia_ para gestionar estudiantes, rankings y sesiones de entrenamiento de la Academia U.A. El proyecto se divide en un backend Node.js/Express con MongoDB y un frontend estático (HTML/CSS/JS) sin frameworks, organizado por componentes reutilizables.

## Características principales

- Registro y autenticación de estudiantes con JWT.
- Panel de control con ranking, estadísticas y gestión de entrenamientos.
- Sistema de inscripción y asistencia con control de cupos y niveles.
- Gestión de perfiles con subida de avatar y estadísticas heroicas.
- UI responsiva y tematizada con componentes reutilizables (navbar, formularios, tarjetas, etc.).

## Estructura del proyecto

```
PROYECTO 10 - FULLSTACK JS/
├── backend/                # API REST (Node.js, Express, MongoDB)
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/         # Modelos de Mongoose
│   │   ├── routes/         # Rutas Express
│   │   ├── middleware/     # Middlewares (auth, validaciones)
│   │   └── utils/          # Helpers (JWT, seeders, uploads)
│   └── uploads/            # Activos subidos por los usuarios
├── frontend/               # Aplicación cliente estática
│   ├── pages/              # Vistas HTML divididas por responsabilidad
│   ├── css/                # Estilos globales, utilidades y por página
│   └── js/                 # Core, componentes y scripts por página
└── README.md
```

## Requisitos

- Node.js 18+
- MongoDB 6+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Configura las variables (ver tabla inferior)
npm run dev            # Servidor con nodemon en http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Inicia live-server en http://localhost:3000
```

> **Nota:** El frontend asume que la API está disponible en `http://localhost:5000/api`. Ajusta `frontend/utils/api.js` si utilizas otro host o puerto.

## Variables de entorno

| Variable      | Descripción                                     |
| ------------- | ----------------------------------------------- |
| `MONGODB_URI` | Cadena de conexión a MongoDB                    |
| `JWT_SECRET`  | Clave para firmar los tokens JWT                |
| `PORT`        | Puerto para el servidor Express (opcional)      |
| `CORS_ORIGIN` | Origen permitido para peticiones desde el front |

## Scripts útiles

### Backend

- `npm run dev`: inicia el servidor con recarga (`nodemon`).
- `npm run seed`: carga datos de ejemplo en la base de datos.

### Frontend

- `npm run dev`.

---

¡Plus Ultra! 💥 Es una app con algun fallo que otro, especialmente hecha para pc, porque no me da tiempo a hacerla bien de movil!
