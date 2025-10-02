import express from "express";
import {
  obtenerEntrenamientos,
  obtenerEntrenamientoPorId,
  crearEntrenamiento,
  actualizarEvento,
  eliminarEvento,
  inscribirseEntrenamiento,
  cancelarInscripcion,
  completarEntrenamiento,
  obtenerEntrenamientosPorTipo,
  eliminarAsistentes,
} from "../controllers/entrenamientosController.js";
import { verificarToken } from "../middleware/auth.js";
import { validarEntrenamiento } from "../middleware/validaciones.js";
import { upload, manejarErrorMulter } from "../utils/upload.js";

const router = express.Router();

// Rutas públicas
router.get("/", obtenerEntrenamientos);
router.get("/estadisticas", obtenerEntrenamientosPorTipo);
router.get("/:id", obtenerEntrenamientoPorId);

// Rutas protegidas - Crear entrenamientos (solo profesores)
router.post(
  "/",
  verificarToken,
  upload.single("imagen"),
  manejarErrorMulter,
  validarEntrenamiento,
  crearEntrenamiento
);

// Rutas protegidas - Actualizar y eliminar (solo instructor)
router.put(
  "/:id",
  verificarToken,
  upload.single("imagen"),
  manejarErrorMulter,
  actualizarEvento
);

router.delete("/:id", verificarToken, eliminarEvento);

// Rutas protegidas - Inscripciones de estudiantes
router.post("/:id/inscribirse", verificarToken, inscribirseEntrenamiento);
router.delete("/:id/inscribirse", verificarToken, cancelarInscripcion);

// Rutas protegidas - Completar entrenamiento (solo instructor)
router.post("/:id/completar", verificarToken, completarEntrenamiento);

// Rutas protegidas - Gestión de asistentes (solo instructor)
router.delete("/:id/asistentes", verificarToken, eliminarAsistentes);

export default router;
