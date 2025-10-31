import mongoose from "mongoose";

const JoyaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  material: { type: String },
  stock: { type: Number, default: 0 },
  imagenes: [String], // URLs públicas (secure_url)
  cloudinary_ids: [String], // public_id de Cloudinary (para borrar)
  fechaCreacion: { type: Date, default: Date.now },
});

export default mongoose.model("Joya", JoyaSchema);
