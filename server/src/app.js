import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import gameRouter from "./routes/gameRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        message: "API de ¿Dónde está Wally? funcionando",
    });
});

app.get("/api/scenes/1", async (req, res) => {
    const scene = await prisma.scene.findUnique({
        where: {
        id: 1,
        },
        include: {
        characters: true,
        },
    });

    if (!scene) {
        return res.status(404).json({
        error: "Escena no encontrada",
        });
    }

    return res.json(scene);
});

app.use("/api/games", gameRouter);

app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        error: "Error interno del servidor",
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});