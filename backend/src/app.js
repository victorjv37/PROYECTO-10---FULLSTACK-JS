import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import entrenamientosRoutes from "./routes/entrenamientos.js";

import { conectarBD } from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

conectarBD();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://tu-frontend-en-vercel.vercel.app"]
        : true, // Permitir todos los orígenes en desarrollo
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Agregar headers para CORS en archivos estáticos
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/entrenamientos", entrenamientosRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Ya existe un registro con esos datos",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID inválido",
    });
  }

  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || "development"}`);
});
