import { body } from "express-validator";

export const validarRegistroEstudiante = [
  body("nombre")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("nombreHeroe")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("El nombre de héroe no puede exceder 30 caracteres"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Debe proporcionar un email válido"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("quirk.nombre")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre del Quirk debe tener entre 1 y 50 caracteres"),

  body("quirk.descripcion")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("La descripción del Quirk debe tener entre 1 y 200 caracteres"),

  body("quirk.tipo")
    .isIn(["emision", "transformacion", "mutacion"])
    .withMessage("El tipo de Quirk debe ser: emision, transformacion o mutacion"),

  body("clase")
    .isIn(["1-A", "1-B", "2-A", "2-B", "3-A", "3-B"])
    .withMessage("Clase inválida"),

  body("rol")
    .optional()
    .isIn(["estudiante", "profesor", "admin"])
    .withMessage("Rol inválido"),
];

export const validarLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Debe proporcionar un email válido"),

  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

export const validarEntrenamiento = [
  body("titulo")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El título debe tener entre 3 y 100 caracteres"),

  body("descripcion")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("La descripción debe tener entre 10 y 1000 caracteres"),

  body("fechaHora")
    .isISO8601()
    .withMessage("Debe proporcionar una fecha y hora válida")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("La fecha del entrenamiento debe ser futura");
      }
      return true;
    }),

  body("ubicacion")
    .isIn([
      "Gimnasio Alfa",
      "Gimnasio Beta", 
      "Gimnasio Gamma",
      "Campo de Entrenamiento A",
      "Campo de Entrenamiento B",
      "Ciudad de Entrenamiento",
      "Zona de Desastres",
      "Laboratorio de Quirks",
      "Piscina de Rescate",
      "Sala de Combate",
    ])
    .withMessage("Ubicación inválida"),

  body("capacidadMaxima")
    .isInt({ min: 1, max: 30 })
    .withMessage("La capacidad máxima debe ser entre 1 y 30 estudiantes"),

  body("nivelRequerido")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El nivel requerido debe ser entre 1 y 100"),

  body("tipo")
    .isIn([
      "combate",
      "rescate", 
      "quirk-development",
      "resistencia",
      "estrategia",
      "trabajo-en-equipo",
      "mision-practica",
    ])
    .withMessage("Tipo de entrenamiento inválido"),

  body("dificultad")
    .optional()
    .isIn(["principiante", "intermedio", "avanzado", "experto"])
    .withMessage("Dificultad inválida"),

  body("duracion")
    .isInt({ min: 30, max: 480 })
    .withMessage("La duración debe ser entre 30 minutos y 8 horas"),
];
