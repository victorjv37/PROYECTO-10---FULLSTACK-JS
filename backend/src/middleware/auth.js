import jwt from "jsonwebtoken";
import Estudiante from "../models/Estudiante.js";
import Entrenamiento from "../models/Entrenamiento.js";

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. Token no proporcionado.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const estudiante = await Estudiante.findById(decoded.id).select("-password");

    if (!estudiante) {
      return res.status(401).json({
        success: false,
        message: "Token inválido. Estudiante no encontrado.",
      });
    }

    req.usuario = estudiante;
    next();
  } catch (error) {
    console.error("Error en verificación de token:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
};

export const esInstructorEntrenamiento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entrenamiento = await Entrenamiento.findById(id);

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado.",
      });
    }

    if (entrenamiento.instructor.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para modificar este entrenamiento.",
      });
    }

    req.entrenamiento = entrenamiento;
    next();
  } catch (error) {
    console.error("Error verificando instructor:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
};

export const esProfesor = async (req, res, next) => {
  try {
    if (req.usuario.rol === "estudiante") {
      return res.status(403).json({
        success: false,
        message: "Solo los profesores pueden realizar esta acción.",
      });
    }

    next();
  } catch (error) {
    console.error("Error verificando rol de profesor:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
};
