import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const estudianteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del estudiante es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    nombreHeroe: {
      type: String,
      trim: true,
      maxlength: [30, "El nombre de héroe no puede exceder 30 caracteres"],
      default: null,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingrese un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    avatar: {
      type: String,
      default: null,
    },
    quirk: {
      nombre: {
        type: String,
        required: [true, "El nombre del Quirk es obligatorio"],
        trim: true,
        maxlength: [50, "El nombre del Quirk no puede exceder 50 caracteres"],
      },
      descripcion: {
        type: String,
        required: [true, "La descripción del Quirk es obligatoria"],
        trim: true,
        maxlength: [200, "La descripción no puede exceder 200 caracteres"],
      },
      tipo: {
        type: String,
        enum: ["emision", "transformacion", "mutacion"],
        required: [true, "El tipo de Quirk es obligatorio"],
      },
    },
    clase: {
      type: String,
      enum: ["1-A", "1-B", "2-A", "2-B", "3-A", "3-B"],
      required: [true, "La clase es obligatoria"],
    },
    nivel: {
      type: Number,
      default: 1,
      min: [1, "El nivel mínimo es 1"],
      max: [100, "El nivel máximo es 100"],
    },
    puntuacion: {
      type: Number,
      default: 0,
      min: [0, "La puntuación no puede ser negativa"],
    },
    rol: {
      type: String,
      enum: ["estudiante", "profesor", "admin"],
      default: "estudiante",
    },
    entrenamientosCreados: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entrenamiento",
      },
    ],
    entrenamientosAsistidos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entrenamiento",
      },
    ],
    estadisticas: {
      fuerza: { type: Number, default: 1, min: 1, max: 10 },
      velocidad: { type: Number, default: 1, min: 1, max: 10 },
      tecnica: { type: Number, default: 1, min: 1, max: 10 },
      inteligencia: { type: Number, default: 1, min: 1, max: 10 },
      cooperacion: { type: Number, default: 1, min: 1, max: 10 },
    },
  },
  {
    timestamps: true,
  }
);

estudianteSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

estudianteSchema.methods.compararPassword = async function (passwordCandidato) {
  return await bcryptjs.compare(passwordCandidato, this.password);
};

estudianteSchema.methods.calcularNivelPoder = function () {
  const stats = this.estadisticas;
  return Math.round((stats.fuerza + stats.velocidad + stats.tecnica + stats.inteligencia + stats.cooperacion) / 5);
};

estudianteSchema.methods.subirNivel = function (puntos = 1) {
  this.nivel = Math.min(this.nivel + puntos, 100);
  this.puntuacion += puntos * 10;
};

estudianteSchema.methods.toJSON = function () {
  const estudiante = this.toObject();
  delete estudiante.password;
  return estudiante;
};

estudianteSchema.virtual("nivelPoder").get(function () {
  return this.calcularNivelPoder();
});

estudianteSchema.set("toJSON", { virtuals: true });
estudianteSchema.set("toObject", { virtuals: true });

export default mongoose.model("Estudiante", estudianteSchema);
