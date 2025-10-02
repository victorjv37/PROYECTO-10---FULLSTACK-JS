import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { conectarBD } from "../config/database.js";
import Estudiante from "../models/Estudiante.js";
import Entrenamiento from "../models/Entrenamiento.js";

dotenv.config();

const estudiantes = [
  {
    nombre: "Toshinori Yagi",
    nombreHeroe: "All Might",
    email: "allmight@ua.edu",
    password: "123456",
    avatar: "fotoheroe-almyght.jpeg",
    quirk: {
      nombre: "One For All",
      descripcion:
        "Quirk acumulativo que se pasa de generación en generación, combinando la fuerza de 9 portadores. Genera fuerza sobrehumana, velocidad increíble y resistencia extrema.",
      tipo: "emision",
    },
    clase: "3-A",
    rol: "profesor",
    nivel: 100,
    puntuacion: 15000,
    estadisticas: {
      fuerza: 10,
      velocidad: 10,
      tecnica: 9,
      inteligencia: 9,
      cooperacion: 10,
    },
  },
  {
    nombre: "Izuku Midoriya",
    nombreHeroe: "Deku",
    email: "midoriya@ua.edu",
    password: "123456",
    avatar: "fotoheroe-deku.jpeg",
    quirk: {
      nombre: "One For All",
      descripcion:
        "Quirk heredado de All Might que combina la fuerza de 9 generaciones. Permite canalizar energía pura generando fuerza sobrehumana, velocidad extrema y ondas de choque devastadoras.",
      tipo: "emision",
    },
    clase: "1-A",
    rol: "estudiante",
    nivel: 35,
    puntuacion: 1250,
    estadisticas: {
      fuerza: 9,
      velocidad: 8,
      tecnica: 7,
      inteligencia: 10,
      cooperacion: 10,
    },
  },
  {
    nombre: "Katsuki Bakugo",
    nombreHeroe: "Dynamight",
    email: "bakugo@ua.edu",
    password: "123456",
    avatar: "fotoheroe-dynamight.jpeg",
    quirk: {
      nombre: "Explosion",
      descripcion:
        "Puede crear explosiones potentes utilizando el sudor nitroceluloso que secreta por las palmas. La intensidad depende de la cantidad de sudor acumulado.",
      tipo: "emision",
    },
    clase: "1-A",
    rol: "estudiante",
    nivel: 32,
    puntuacion: 1100,
    estadisticas: {
      fuerza: 9,
      velocidad: 8,
      tecnica: 9,
      inteligencia: 8,
      cooperacion: 5,
    },
  },
  {
    nombre: "Shoto Todoroki",
    nombreHeroe: "Shoto",
    email: "todoroki@ua.edu",
    password: "123456",
    avatar: "fotoheroe-shoto.jpeg",
    quirk: {
      nombre: "Half-Cold Half-Hot",
      descripcion:
        "Quirk dual heredado de sus padres. Puede generar hielo desde su lado derecho y fuego desde su lado izquierdo. Control total sobre temperatura.",
      tipo: "emision",
    },
    clase: "1-A",
    rol: "estudiante",
    nivel: 30,
    puntuacion: 1050,
    estadisticas: {
      fuerza: 8,
      velocidad: 7,
      tecnica: 10,
      inteligencia: 9,
      cooperacion: 7,
    },
  },
  {
    nombre: "Ochaco Uraraka",
    nombreHeroe: "Uravity",
    email: "uraraka@ua.edu",
    password: "123456",
    avatar: "fotoheroe-uravity.jpeg",
    quirk: {
      nombre: "Zero Gravity",
      descripcion: "Puede hacer que los objetos que toca floten",
      tipo: "emision",
    },
    clase: "1-A",
    rol: "estudiante",
    nivel: 22,
    puntuacion: 750,
    estadisticas: {
      fuerza: 5,
      velocidad: 7,
      tecnica: 8,
      inteligencia: 8,
      cooperacion: 9,
    },
  },
  {
    nombre: "Tenya Iida",
    nombreHeroe: "Ingenium",
    email: "iida@ua.edu",
    password: "123456",
    avatar: "fotoheroe-ingenium.jpeg",
    quirk: {
      nombre: "Engine",
      descripcion:
        "Motores en sus piernas que le permiten correr a alta velocidad",
      tipo: "mutacion",
    },
    clase: "1-A",
    rol: "estudiante",
    nivel: 23,
    puntuacion: 780,
    estadisticas: {
      fuerza: 6,
      velocidad: 10,
      tecnica: 7,
      inteligencia: 9,
      cooperacion: 9,
    },
  },
  {
    nombre: "Momo Yaoyorozu",
    nombreHeroe: "Creati",
    email: "yaoyorozu@ua.edu",
    password: "123456",
    avatar: "fotoheroe-creati.jpeg",
    quirk: {
      nombre: "Creation",
      descripcion: "Puede crear cualquier objeto no vivo desde su cuerpo",
      tipo: "emision",
    },
    clase: "1-A",
    rol: "estudiante",
    nivel: 24,
    puntuacion: 830,
    estadisticas: {
      fuerza: 6,
      velocidad: 6,
      tecnica: 9,
      inteligencia: 10,
      cooperacion: 8,
    },
  },
  {
    nombre: "Shota Aizawa",
    nombreHeroe: "Eraser Head",
    email: "aizawa@ua.edu",
    password: "123456",
    avatar: "fotoheroe-eraserhead.jpeg",
    quirk: {
      nombre: "Erasure",
      descripcion:
        "Puede cancelar temporalmente los quirks de otros héroes al mirarlos directamente. Especialmente efectivo contra villanos que dependen completamente de sus habilidades.",
      tipo: "emision",
    },
    clase: "1-A",
    rol: "profesor",
    nivel: 85,
    puntuacion: 8500,
    estadisticas: {
      fuerza: 7,
      velocidad: 8,
      tecnica: 10,
      inteligencia: 9,
      cooperacion: 8,
    },
  },
];

const entrenamientos = [
  {
    titulo: "Entrenamiento de Combate Básico",
    descripcion:
      "Sesión de entrenamiento para mejorar las habilidades de combate cuerpo a cuerpo y el uso básico de quirks en situaciones de enfrentamiento.",
    fechaHora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
    ubicacion: "Gimnasio Alfa",
    capacidadMaxima: 20,
    nivelRequerido: 1,
    tipo: "combate",
    dificultad: "principiante",
    duracion: 120,
    imagen: "campo-01.jpeg",
    recompensas: {
      experiencia: 15,
      puntos: 10,
    },
  },
  {
    titulo: "Misión de Rescate en Ciudad",
    descripcion:
      "Simulacro de rescate en un entorno urbano. Los estudiantes deben trabajar en equipo para evacuar civiles y neutralizar amenazas.",
    fechaHora: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    ubicacion: "Ciudad de Entrenamiento",
    capacidadMaxima: 15,
    nivelRequerido: 20,
    tipo: "rescate",
    dificultad: "intermedio",
    duracion: 180,
    imagen: "campo-02.jpeg",
    recompensas: {
      experiencia: 25,
      puntos: 20,
    },
  },
  {
    titulo: "Desarrollo de Quirk Avanzado",
    descripcion:
      "Sesión especializada para el desarrollo y perfeccionamiento de quirks individuales bajo supervisión experta.",
    fechaHora: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    ubicacion: "Laboratorio de Quirks",
    capacidadMaxima: 8,
    nivelRequerido: 15,
    tipo: "quirk-development",
    dificultad: "avanzado",
    duracion: 240,
    imagen: "campo-03.jpeg",
    recompensas: {
      experiencia: 30,
      puntos: 25,
    },
  },
  {
    titulo: "Entrenamiento de Resistencia",
    descripcion:
      "Sesión intensiva para mejorar la resistencia física y mental. Incluye carreras, ejercicios de fuerza y técnicas de respiración.",
    fechaHora: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    ubicacion: "Campo de Entrenamiento A",
    capacidadMaxima: 25,
    nivelRequerido: 5,
    tipo: "resistencia",
    dificultad: "intermedio",
    duracion: 150,
    imagen: "campo-04.jpeg",
    recompensas: {
      experiencia: 20,
      puntos: 15,
    },
  },
  {
    titulo: "Estrategia de Combate en Equipo",
    descripcion:
      "Los estudiantes aprenderán tácticas avanzadas de combate en equipo y coordinación de quirks para maximizar la efectividad.",
    fechaHora: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    ubicacion: "Sala de Combate",
    capacidadMaxima: 12,
    nivelRequerido: 25,
    tipo: "trabajo-en-equipo",
    dificultad: "avanzado",
    duracion: 180,
    imagen: "campo-05.jpeg",
    recompensas: {
      experiencia: 35,
      puntos: 30,
    },
  },
  {
    titulo: "Simulacro de Zona de Desastres",
    descripcion:
      "Entrenamiento en condiciones extremas simulando desastres naturales. Requiere adaptabilidad y trabajo bajo presión.",
    fechaHora: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    ubicacion: "Zona de Desastres",
    capacidadMaxima: 18,
    nivelRequerido: 30,
    tipo: "mision-practica",
    dificultad: "experto",
    duracion: 300,
    imagen: "campo-06.jpeg",
    recompensas: {
      experiencia: 50,
      puntos: 40,
    },
  },
];

const seedDatabase = async () => {
  try {
    await conectarBD();
    console.log("🦸‍♂️ Iniciando seeding de la Academia de Héroes U.A...");

    // Limpiar datos existentes
    await Estudiante.deleteMany({});
    await Entrenamiento.deleteMany({});
    console.log("🗑️  Datos existentes eliminados");

    // Crear estudiantes
    const estudiantesCreados = [];
    for (const estudianteData of estudiantes) {
      const estudiante = new Estudiante(estudianteData);
      await estudiante.save();
      estudiantesCreados.push(estudiante);
    }
    console.log(
      `🎓 ${estudiantesCreados.length} estudiantes y profesores creados`
    );

    // Crear entrenamientos con instructores (profesores)
    const profesores = estudiantesCreados.filter((e) => e.rol === "profesor");
    const entrenamientosCreados = [];

    for (const entrenamientoData of entrenamientos) {
      const instructorAleatorio =
        profesores[Math.floor(Math.random() * profesores.length)];

      const entrenamiento = new Entrenamiento({
        ...entrenamientoData,
        instructor: instructorAleatorio._id,
      });

      await entrenamiento.save();

      // Actualizar el instructor
      await Estudiante.findByIdAndUpdate(instructorAleatorio._id, {
        $push: { entrenamientosCreados: entrenamiento._id },
      });

      entrenamientosCreados.push(entrenamiento);
    }
    console.log(`💪 ${entrenamientosCreados.length} entrenamientos creados`);

    // Inscribir algunos estudiantes en entrenamientos
    const estudiantesFiltered = estudiantesCreados.filter(
      (e) => e.rol === "estudiante"
    );

    for (const entrenamiento of entrenamientosCreados) {
      const estudiantesElegibles = estudiantesFiltered.filter(
        (e) => e.nivel >= entrenamiento.nivelRequerido
      );

      const numParticipantes = Math.min(
        Math.floor(Math.random() * 5) + 2, // 2-6 participantes
        estudiantesElegibles.length,
        entrenamiento.capacidadMaxima
      );

      const participantesSeleccionados = estudiantesElegibles
        .sort(() => 0.5 - Math.random())
        .slice(0, numParticipantes);

      for (const participante of participantesSeleccionados) {
        entrenamiento.participantes.push(participante._id);
        await Estudiante.findByIdAndUpdate(participante._id, {
          $push: { entrenamientosAsistidos: entrenamiento._id },
        });
      }

      await entrenamiento.save();
    }

    console.log("✅ Plus Ultra! Seeding completado exitosamente");
    console.log("\n📊 Resumen de la Academia U.A.:");
    console.log(`- Estudiantes: ${estudiantesFiltered.length}`);
    console.log(`- Profesores: ${profesores.length}`);
    console.log(`- Entrenamientos: ${entrenamientosCreados.length}`);
    console.log("\n🔐 Credenciales de prueba:");
    console.log("👨‍🏫 Profesor All Might:");
    console.log("  Email: allmight@ua.edu");
    console.log("  Password: 123456");
    console.log("\n🎓 Estudiante Deku:");
    console.log("  Email: midoriya@ua.edu");
    console.log("  Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
