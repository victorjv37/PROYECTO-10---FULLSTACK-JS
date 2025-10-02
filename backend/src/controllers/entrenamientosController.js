import Entrenamiento from "../models/Entrenamiento.js";
import Estudiante from "../models/Estudiante.js";
import { validationResult } from "express-validator";

export const obtenerEntrenamientos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      tipo,
      dificultad,
      nivelMinimo,
      nivelMaximo,
      ordenPor = "fechaHora",
      orden = "asc",
      busqueda,
    } = req.query;

    const filtros = { estado: "programado" };

    if (tipo && tipo !== "all") {
      filtros.tipo = tipo;
    }

    if (dificultad && dificultad !== "all") {
      filtros.dificultad = dificultad;
    }

    if (nivelMinimo) {
      filtros.nivelRequerido = { $gte: parseInt(nivelMinimo) };
    }

    if (nivelMaximo) {
      if (filtros.nivelRequerido) {
        filtros.nivelRequerido.$lte = parseInt(nivelMaximo);
      } else {
        filtros.nivelRequerido = { $lte: parseInt(nivelMaximo) };
      }
    }

    if (busqueda) {
      filtros.$text = { $search: busqueda };
    }

    const sortOptions = {};
    sortOptions[ordenPor] = orden === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const entrenamientos = await Entrenamiento.find(filtros)
      .populate("instructor", "nombre nombreHeroe email avatar clase")
      .populate("participantes", "nombre nombreHeroe email avatar clase nivel")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalEntrenamientos = await Entrenamiento.countDocuments(filtros);
    const totalPaginas = Math.ceil(totalEntrenamientos / parseInt(limit));

    res.json({
      success: true,
      data: {
        entrenamientos,
        paginacion: {
          paginaActual: parseInt(page),
          totalPaginas,
          totalEntrenamientos,
          entrenamientosEnPagina: entrenamientos.length,
        },
      },
    });
  } catch (error) {
    console.error("Error obteniendo entrenamientos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const obtenerEntrenamientoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const entrenamiento = await Entrenamiento.findById(id)
      .populate(
        "instructor",
        "nombre nombreHeroe email avatar clase estadisticas"
      )
      .populate("participantes", "nombre nombreHeroe email avatar clase nivel");

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    res.json({
      success: true,
      data: entrenamiento,
    });
  } catch (error) {
    console.error("Error obteniendo entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const crearEntrenamiento = async (req, res) => {
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
      titulo,
      descripcion,
      fechaHora,
      ubicacion,
      capacidadMaxima,
      nivelRequerido,
      tipo,
      dificultad,
      duracion,
      recompensas,
    } = req.body;
    const imagen = req.file ? req.file.filename : null;

    // Verificar que el usuario puede crear entrenamientos (profesor o admin)
    const instructor = await Estudiante.findById(req.usuario._id);
    if (instructor.rol === "estudiante") {
      return res.status(403).json({
        success: false,
        message: "Solo los profesores pueden crear entrenamientos",
      });
    }

    const nuevoEntrenamiento = new Entrenamiento({
      titulo,
      descripcion,
      fechaHora: new Date(fechaHora),
      ubicacion,
      capacidadMaxima,
      nivelRequerido: nivelRequerido || 1,
      tipo,
      dificultad: dificultad || "principiante",
      duracion,
      recompensas: recompensas || { experiencia: 10, puntos: 5 },
      imagen,
      instructor: req.usuario._id,
    });

    await nuevoEntrenamiento.save();

    await Estudiante.findByIdAndUpdate(req.usuario._id, {
      $push: { entrenamientosCreados: nuevoEntrenamiento._id },
    });

    await nuevoEntrenamiento.populate(
      "instructor",
      "nombre nombreHeroe email avatar clase"
    );

    res.status(201).json({
      success: true,
      message: "Entrenamiento creado exitosamente",
      data: nuevoEntrenamiento,
    });
  } catch (error) {
    console.error("Error creando entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      fechaHora,
      ubicacion,
      capacidadMaxima,
      nivelRequerido,
      tipo,
      dificultad,
      duracion,
      recompensas,
    } = req.body;
    const imagen = req.file ? req.file.filename : undefined;

    console.log("Actualizar entrenamiento - ID:", id);
    console.log("Actualizar entrenamiento - Body:", req.body);
    console.log("Actualizar entrenamiento - File:", req.file);

    const entrenamiento = await Entrenamiento.findById(id);

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    // Verificar que el usuario es el instructor
    if (entrenamiento.instructor.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para modificar este entrenamiento",
      });
    }

    const datosActualizacion = {};
    if (titulo) datosActualizacion.titulo = titulo;
    if (descripcion) datosActualizacion.descripcion = descripcion;
    if (fechaHora) datosActualizacion.fechaHora = new Date(fechaHora);
    if (ubicacion) datosActualizacion.ubicacion = ubicacion;
    if (capacidadMaxima !== undefined)
      datosActualizacion.capacidadMaxima = parseInt(capacidadMaxima);
    if (nivelRequerido !== undefined)
      datosActualizacion.nivelRequerido = parseInt(nivelRequerido);
    if (tipo) datosActualizacion.tipo = tipo;
    if (dificultad) datosActualizacion.dificultad = dificultad;
    if (duracion !== undefined)
      datosActualizacion.duracion = parseInt(duracion);
    if (recompensas) {
      try {
        datosActualizacion.recompensas =
          typeof recompensas === "string"
            ? JSON.parse(recompensas)
            : recompensas;
      } catch (e) {
        datosActualizacion.recompensas = recompensas;
      }
    }
    if (imagen) datosActualizacion.imagen = imagen;

    const entrenamientoActualizado = await Entrenamiento.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    )
      .populate("instructor", "nombre nombreHeroe email avatar clase")
      .populate("participantes", "nombre nombreHeroe email avatar clase nivel");

    res.json({
      success: true,
      message: "Entrenamiento actualizado exitosamente",
      data: entrenamientoActualizado,
    });
  } catch (error) {
    console.error("Error actualizando entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findById(id);

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: "Evento no encontrado",
      });
    }

    if (evento.creador.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar este evento",
      });
    }

    await Evento.findByIdAndDelete(id);

    await Usuario.updateMany(
      { $or: [{ eventosCreados: id }, { eventosAsistidos: id }] },
      {
        $pull: {
          eventosCreados: id,
          eventosAsistidos: id,
        },
      }
    );

    res.json({
      success: true,
      message: "Evento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando evento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const inscribirseEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.usuario._id;

    const entrenamiento = await Entrenamiento.findById(id);
    const estudiante = await Estudiante.findById(estudianteId);

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    if (!entrenamiento.puedeParticipar(estudiante)) {
      if (entrenamiento.estaLleno) {
        return res.status(400).json({
          success: false,
          message: "El entrenamiento ha alcanzado su capacidad máxima",
        });
      }
      if (estudiante.nivel < entrenamiento.nivelRequerido) {
        return res.status(400).json({
          success: false,
          message: `Necesitas al menos nivel ${entrenamiento.nivelRequerido} para este entrenamiento`,
        });
      }
      if (entrenamiento.participantes.includes(estudianteId)) {
        return res.status(400).json({
          success: false,
          message: "Ya estás inscrito en este entrenamiento",
        });
      }
    }

    entrenamiento.participantes.push(estudianteId);
    await entrenamiento.save();

    await Estudiante.findByIdAndUpdate(estudianteId, {
      $push: { entrenamientosAsistidos: id },
    });

    await entrenamiento.populate(
      "participantes",
      "nombre nombreHeroe email avatar clase nivel"
    );

    res.json({
      success: true,
      message: "Inscripción exitosa al entrenamiento",
      data: entrenamiento,
    });
  } catch (error) {
    console.error("Error inscribiendo al entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const cancelarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteId = req.usuario._id;

    const entrenamiento = await Entrenamiento.findById(id);

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    if (!entrenamiento.participantes.includes(estudianteId)) {
      return res.status(400).json({
        success: false,
        message: "No estás inscrito en este entrenamiento",
      });
    }

    entrenamiento.participantes = entrenamiento.participantes.filter(
      (participante) => participante.toString() !== estudianteId.toString()
    );
    await entrenamiento.save();

    await Estudiante.findByIdAndUpdate(estudianteId, {
      $pull: { entrenamientosAsistidos: id },
    });

    await entrenamiento.populate(
      "participantes",
      "nombre nombreHeroe email avatar clase nivel"
    );

    res.json({
      success: true,
      message: "Inscripción cancelada exitosamente",
      data: entrenamiento,
    });
  } catch (error) {
    console.error("Error cancelando inscripción:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const completarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultados } = req.body; // Array con los resultados de cada participante

    const entrenamiento = await Entrenamiento.findById(id)
      .populate("instructor", "nombre nombreHeroe")
      .populate(
        "participantes",
        "nombre nombreHeroe nivel puntuacion estadisticas"
      );

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    // Verificar que el usuario es el instructor
    if (
      entrenamiento.instructor._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor puede completar el entrenamiento",
      });
    }

    // Marcar entrenamiento como completado
    entrenamiento.estado = "completado";
    await entrenamiento.save();

    // Recompensar a los participantes
    const actualizacionesEstudiantes = [];

    for (let participante of entrenamiento.participantes) {
      const experienciaGanada = entrenamiento.recompensas.experiencia;
      const puntosGanados = entrenamiento.recompensas.puntos;

      // Subir nivel basado en la experiencia
      participante.subirNivel();

      // Mejorar estadísticas basado en el tipo de entrenamiento
      const mejoras = {};
      switch (entrenamiento.tipo) {
        case "combate":
          mejoras["estadisticas.fuerza"] = Math.min(
            participante.estadisticas.fuerza + 0.1,
            10
          );
          mejoras["estadisticas.tecnica"] = Math.min(
            participante.estadisticas.tecnica + 0.1,
            10
          );
          break;
        case "rescate":
          mejoras["estadisticas.velocidad"] = Math.min(
            participante.estadisticas.velocidad + 0.1,
            10
          );
          mejoras["estadisticas.cooperacion"] = Math.min(
            participante.estadisticas.cooperacion + 0.1,
            10
          );
          break;
        case "quirk-development":
          mejoras["estadisticas.tecnica"] = Math.min(
            participante.estadisticas.tecnica + 0.2,
            10
          );
          break;
        case "resistencia":
          mejoras["estadisticas.fuerza"] = Math.min(
            participante.estadisticas.fuerza + 0.1,
            10
          );
          mejoras["estadisticas.velocidad"] = Math.min(
            participante.estadisticas.velocidad + 0.1,
            10
          );
          break;
        case "estrategia":
          mejoras["estadisticas.inteligencia"] = Math.min(
            participante.estadisticas.inteligencia + 0.2,
            10
          );
          break;
        case "trabajo-en-equipo":
          mejoras["estadisticas.cooperacion"] = Math.min(
            participante.estadisticas.cooperacion + 0.2,
            10
          );
          break;
      }

      actualizacionesEstudiantes.push(
        Estudiante.findByIdAndUpdate(
          participante._id,
          {
            $inc: {
              nivel: 1,
              puntuacion: puntosGanados,
            },
            $set: mejoras,
          },
          { new: true }
        )
      );
    }

    await Promise.all(actualizacionesEstudiantes);

    res.json({
      success: true,
      message:
        "Entrenamiento completado. ¡Los estudiantes han mejorado sus habilidades!",
      data: {
        entrenamiento,
        participantesActualizados: entrenamiento.participantes.length,
      },
    });
  } catch (error) {
    console.error("Error completando entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const obtenerEntrenamientosPorTipo = async (req, res) => {
  try {
    const tipos = await Entrenamiento.aggregate([
      {
        $group: {
          _id: "$tipo",
          total: { $sum: 1 },
          programados: {
            $sum: { $cond: [{ $eq: ["$estado", "programado"] }, 1, 0] },
          },
          completados: {
            $sum: { $cond: [{ $eq: ["$estado", "completado"] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: tipos,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const eliminarAsistentes = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeIds } = req.body;

    console.log("Eliminar asistentes - ID entrenamiento:", id);
    console.log("Eliminar asistentes - IDs a eliminar:", attendeeIds);
    console.log("Eliminar asistentes - Body completo:", req.body);

    if (
      !attendeeIds ||
      !Array.isArray(attendeeIds) ||
      attendeeIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Se requiere al menos un ID de asistente para eliminar",
      });
    }

    const entrenamiento = await Entrenamiento.findById(id);

    if (!entrenamiento) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    if (entrenamiento.instructor.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor puede eliminar asistentes",
      });
    }

    entrenamiento.participantes = entrenamiento.participantes.filter(
      (participante) => !attendeeIds.includes(participante.toString())
    );
    await entrenamiento.save();

    await Estudiante.updateMany(
      { _id: { $in: attendeeIds } },
      { $pull: { entrenamientosAsistidos: id } }
    );

    await entrenamiento.populate(
      "participantes",
      "nombre nombreHeroe email avatar clase nivel"
    );

    res.json({
      success: true,
      message: `${attendeeIds.length} asistente(s) eliminado(s) exitosamente`,
      data: entrenamiento,
    });
  } catch (error) {
    console.error("Error eliminando asistentes:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
