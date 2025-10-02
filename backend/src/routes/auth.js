import express from "express";
import {
  registrarEstudiante,
  loginEstudiante,
  obtenerPerfil,
  actualizarPerfil,
  obtenerRanking,
} from "../controllers/authController.js";
import { verificarToken } from "../middleware/auth.js";
import { validarRegistroEstudiante, validarLogin } from "../middleware/validaciones.js";
import { upload, manejarErrorMulter } from "../utils/upload.js";

const router = express.Router();

// Rutas de autenticación
router.post("/registro", validarRegistroEstudiante, registrarEstudiante);
router.post("/login", validarLogin, loginEstudiante);

// Rutas protegidas
router.get("/perfil", verificarToken, obtenerPerfil);
router.put(
  "/perfil",
  verificarToken,
  upload.single("avatar"),
  manejarErrorMulter,
  actualizarPerfil
);

// Rutas públicas
router.get("/ranking", obtenerRanking);

export default router;
