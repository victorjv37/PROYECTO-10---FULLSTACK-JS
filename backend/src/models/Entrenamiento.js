import mongoose from "mongoose";

const entrenamientoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título del entrenamiento es obligatorio"],
      trim: true,
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    fechaHora: {
      type: Date,
      required: [true, "La fecha y hora son obligatorias"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "La fecha del entrenamiento debe ser futura",
      },
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicación es obligatoria"],
      trim: true,
      enum: [
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
      ],
    },
    imagen: {
      type: String,
      default: null,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: [true, "El instructor es obligatorio"],
    },
    participantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Estudiante",
      },
    ],
    capacidadMaxima: {
      type: Number,
      required: [true, "La capacidad máxima es obligatoria"],
      min: [1, "La capacidad máxima debe ser al menos 1"],
      max: [30, "La capacidad máxima no puede exceder 30 estudiantes"],
    },
    nivelRequerido: {
      type: Number,
      default: 1,
      min: [1, "El nivel mínimo requerido es 1"],
      max: [100, "El nivel máximo requerido es 100"],
    },
    tipo: {
      type: String,
      enum: [
        "combate",
        "rescate",
        "quirk-development",
        "resistencia",
        "estrategia",
        "trabajo-en-equipo",
        "mision-practica",
      ],
      required: [true, "El tipo de entrenamiento es obligatorio"],
    },
    dificultad: {
      type: String,
      enum: ["principiante", "intermedio", "avanzado", "experto"],
      default: "principiante",
    },
    recompensas: {
      experiencia: {
        type: Number,
        default: 10,
        min: [1, "La experiencia mínima es 1"],
      },
      puntos: {
        type: Number,
        default: 5,
        min: [1, "Los puntos mínimos son 1"],
      },
    },
    estado: {
      type: String,
      enum: ["programado", "en-curso", "completado", "cancelado"],
      default: "programado",
    },
    duracion: {
      type: Number,
      required: [true, "La duración es obligatoria"],
      min: [30, "La duración mínima es 30 minutos"],
      max: [480, "La duración máxima es 8 horas"],
    },
  },
  {
    timestamps: true,
  }
);

entrenamientoSchema.index({ fechaHora: 1 });
entrenamientoSchema.index({ tipo: 1 });
entrenamientoSchema.index({ instructor: 1 });
entrenamientoSchema.index({ dificultad: 1 });
entrenamientoSchema.index({ nivelRequerido: 1 });
entrenamientoSchema.index({ titulo: "text", descripcion: "text" });

entrenamientoSchema.virtual("numeroParticipantes").get(function () {
  return this.participantes?.length || 0;
});

entrenamientoSchema.virtual("estaLleno").get(function () {
  const numParticipantes = this.participantes?.length || 0;
  return numParticipantes >= this.capacidadMaxima;
});

entrenamientoSchema.virtual("plazasDisponibles").get(function () {
  const numParticipantes = this.participantes?.length || 0;
  return this.capacidadMaxima - numParticipantes;
});

entrenamientoSchema.virtual("duracionEnHoras").get(function () {
  return this.duracion / 60;
});

entrenamientoSchema.methods.puedeParticipar = function (estudiante) {
  return (
    estudiante.nivel >= this.nivelRequerido &&
    !this.estaLleno &&
    !this.participantes.includes(estudiante._id) &&
    this.estado === "programado"
  );
};

entrenamientoSchema.methods.completarEntrenamiento = function () {
  this.estado = "completado";
  return this.save();
};

entrenamientoSchema.set("toJSON", { virtuals: true });
entrenamientoSchema.set("toObject", { virtuals: true });

export default mongoose.model("Entrenamiento", entrenamientoSchema);
