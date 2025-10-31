import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cloudinary from "../utils/cloudinary.js";
import Joya from "../models/Joya.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // carpeta temporal

// GET - todas las joyas
router.get("/", async (req, res) => {
  try {
    const joyas = await Joya.find().sort({ fechaCreacion: -1 });
    res.json(joyas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener joyas" });
  }
});

// GET - una joya
router.get("/:id", async (req, res) => {
  try {
    const joya = await Joya.findById(req.params.id);
    if (!joya) return res.status(404).json({ error: "No encontrada" });
    res.json(joya);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la joya" });
  }
});

// POST - crear joya con una o varias imágenes
// campo multipart: "imagenes" (puede ser múltiples)
router.post("/", upload.array("imagenes", 8), async (req, res) => {
  try {
    const files = req.files || [];
    const uploadResults = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "joyas",
      });
      uploadResults.push(result);
      // borrar archivo temporal
      await fs.unlink(file.path);
    }

    const imagenes = uploadResults.map(r => r.secure_url);
    const cloudinary_ids = uploadResults.map(r => r.public_id);

    const nuevaJoya = new Joya({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      material: req.body.material,
      stock: req.body.stock,
      imagenes,
      cloudinary_ids
    });

    await nuevaJoya.save();
    res.status(201).json(nuevaJoya);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la joya" });
  }
});

// PUT - actualizar campos (sin tocar imágenes)
router.put("/:id", async (req, res) => {
  try {
    const update = req.body;
    const joya = await Joya.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(joya);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar la joya" });
  }
});

// PUT - reemplazar imágenes (subir nuevas y eliminar anteriores)
router.put("/:id/imagenes", upload.array("imagenes", 8), async (req, res) => {
  try {
    const joya = await Joya.findById(req.params.id);
    if (!joya) return res.status(404).json({ error: "Joya no encontrada" });

    // 1) subir nuevas
    const files = req.files || [];
    const uploadResults = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: "joyas" });
      uploadResults.push(result);
      await fs.unlink(file.path);
    }

    // 2) borrar imágenes antiguas en Cloudinary
    for (const public_id of joya.cloudinary_ids || []) {
      try {
        await cloudinary.uploader.destroy(public_id);
      } catch (e) {
        console.warn("No se pudo borrar public_id:", public_id, e.message);
      }
    }

    // 3) actualizar documento
    joya.imagenes = uploadResults.map(r => r.secure_url);
    joya.cloudinary_ids = uploadResults.map(r => r.public_id);
    await joya.save();

    res.json(joya);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al reemplazar imágenes" });
  }
});

// DELETE - eliminar una joya y sus imágenes en Cloudinary
router.delete("/:id", async (req, res) => {
  try {
    const joya = await Joya.findById(req.params.id);
    if (!joya) return res.status(404).json({ error: "No encontrada" });

    // borrar cada imagen en Cloudinary
    for (const public_id of joya.cloudinary_ids || []) {
      try {
        await cloudinary.uploader.destroy(public_id);
      } catch (e) {
        console.warn("Error al borrar imagen:", public_id, e.message);
      }
    }

    await Joya.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Joya eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la joya" });
  }
});

// DELETE - borrar solo una imagen de una joya (por public_id)
router.delete("/:id/imagen", async (req, res) => {
  // esperar body { public_id: "..." }
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ error: "Falta public_id" });

    const joya = await Joya.findById(req.params.id);
    if (!joya) return res.status(404).json({ error: "No encontrada" });

    // borrar en Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // quitar de los arrays
    joya.cloudinary_ids = joya.cloudinary_ids.filter(id => id !== public_id);
    // mantener imagenes (filtrar por que no incluya el public_id)
    // Cloudinary devuelve secure_url sin public_id directo, así que mantenemos sincronía por índice:
    // Mejor enfoque: mantener arrays sincronizados por índice. Aquí simplificamos:
    // reconstruimos imagenes a partir de cloudinary_ids usando admin API si lo deseas, pero para ahora:
    // eliminamos la imagen correspondiente por índice:
    const idx = joya.cloudinary_ids.indexOf(public_id);
    if (idx !== -1) joya.imagenes.splice(idx, 1);

    await joya.save();
    res.json(joya);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al borrar la imagen" });
  }
});

export default router;
