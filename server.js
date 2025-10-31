import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import joyasRoutes from "./routes/joyas.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // parse application/json

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error MongoDB:", err));

app.use("/api/joyas", joyasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend en puerto ${PORT}`));
