import mongoose from "mongoose";

export const conectarBD = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://victorjv37:Javier2002@cluster0.lfgne3k.mongodb.net/Eventos";

    console.log(
      "🔍 Intentando conectar a:",
      mongoUri?.substring(0, 20) + "..."
    );
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");
    console.log("📊 Host:", mongoose.connection.host);
    console.log("📦 Base de datos:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose conectado a MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Error en la conexión de Mongoose:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose desconectado");
});
