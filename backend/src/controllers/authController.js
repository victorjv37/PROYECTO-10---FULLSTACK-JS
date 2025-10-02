import Estudiante from "../models/Estudiante.js";
import { generarToken } from "../utils/jwt.js";
import { validationResult } from "express-validator";

export const registrarEstudiante = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      });
    }

    const {
      nombre,
      email,
      password,
      nombreHeroe,
      quirk,
      clase,
      rol = "estudiante",
    } = req.body;

    const estudianteExistente = await Estudiante.findOne({ email });
    if (estudianteExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un estudiante con este email",
      });
    }

    const nuevoEstudiante = new Estudiante({
      nombre,
      nombreHeroe,
      email,
      password,
      quirk,
      clase,
      rol,
      estadisticas: {
        fuerza: 1,
        velocidad: 1,
        tecnica: 1,
        inteligencia: 1,
        cooperacion: 1,
      },
    });

    await nuevoEstudiante.save();

    const token = generarToken(nuevoEstudiante._id);

    console.log("✅ Estudiante registrado:", {
      id: nuevoEstudiante._id,
      nombre: nuevoEstudiante.nombre,
      nombreHeroe: nuevoEstudiante.nombreHeroe,
      email: nuevoEstudiante.email,
      clase: nuevoEstudiante.clase,
    });

    const responseData = {
      success: true,
      message: "Estudiante registrado exitosamente en la U.A. High School!",
      data: {
        estudiante: nuevoEstudiante,
        token,
      },
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const loginEstudiante = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const estudiante = await Estudiante.findOne({ email });
    if (!estudiante) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const passwordValido = await estudiante.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const token = generarToken(estudiante._id);

    res.json({
      success: true,
      message: `¡Bienvenido de vuelta a la U.A., ${
        estudiante.nombreHeroe || estudiante.nombre
      }!`,
      data: {
        estudiante,
        token,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.usuario._id)
      .populate("entrenamientosCreados", "titulo fechaHora ubicacion tipo")
      .populate("entrenamientosAsistidos", "titulo fechaHora ubicacion tipo");

    res.json({
      success: true,
      data: estudiante,
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, nombreHeroe, quirk, estadisticas } = req.body;
    const avatar = req.file ? req.file.filename : undefined;

    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (nombreHeroe) datosActualizacion.nombreHeroe = nombreHeroe;
    if (quirk) datosActualizacion.quirk = quirk;
    if (estadisticas) datosActualizacion.estadisticas = estadisticas;
    if (avatar) datosActualizacion.avatar = avatar;

    const estudianteActualizado = await Estudiante.findByIdAndUpdate(
      req.usuario._id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Perfil de héroe actualizado exitosamente",
      data: estudianteActualizado,
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const obtenerRanking = async (req, res) => {
  try {
    const { limite = 10, clase } = req.query;

    const filtros = {};
    if (clase) filtros.clase = clase;

    const ranking = await Estudiante.find(filtros)
      .select("nombre nombreHeroe clase nivel puntuacion avatar estadisticas")
      .sort({ puntuacion: -1, nivel: -1 })
      .limit(parseInt(limite));

    res.json({
      success: true,
      message: "Ranking de héroes obtenido exitosamente",
      data: ranking,
    });
  } catch (error) {
    console.error("Error obteniendo ranking:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
