import prisma from "../lib/prisma.js";

export async function startGame(req, res) {
    const sceneId = Number(req.body.sceneId);

    if (!Number.isInteger(sceneId) || sceneId <= 0) {
        return res.status(400).json({
        error: "El sceneId debe ser un número entero válido",
        });
    }

    const scene = await prisma.scene.findUnique({
        where: {
        id: sceneId,
        },
        select: {
        id: true,
        name: true,
        imageUrl: true,
        characters: {
            select: {
            id: true,
            name: true,
            imageUrl: true,
            },
        },
        },
    });

    if (!scene) {
        return res.status(404).json({
        error: "Escena no encontrada",
        });
    }

    const game = await prisma.game.create({
        data: {
        sceneId: scene.id,
        },
    });

    return res.status(201).json({
        gameId: game.id,
        startedAt: game.startedAt,
        scene,
    });
}

export async function validateCharacter(req, res) {
    const { gameId } = req.params;
    const characterId = Number(req.body.characterId);
    const x = Number(req.body.x);
    const y = Number(req.body.y);

    if (!gameId) {
        return res.status(400).json({
        error: "Falta el identificador de la partida",
        });
    }

    if (!Number.isInteger(characterId) || characterId <= 0) {
        return res.status(400).json({
        error: "El characterId no es válido",
        });
    }

    if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        x < 0 ||
        x > 1 ||
        y < 0 ||
        y > 1
    ) {
        return res.status(400).json({
        error: "Las coordenadas deben estar entre 0 y 1",
        });
    }

    const game = await prisma.game.findUnique({
        where: {
        id: gameId,
        },
        include: {
        foundCharacters: {
            select: {
            characterId: true,
            },
        },
        },
    });

    if (!game) {
        return res.status(404).json({
        error: "Partida no encontrada",
        });
    }

    if (game.completed) {
        return res.status(409).json({
        error: "Esta partida ya terminó",
        });
    }

    const character = await prisma.character.findFirst({
        where: {
        id: characterId,
        sceneId: game.sceneId,
        },
    });

    if (!character) {
        return res.status(404).json({
        error: "Personaje no encontrado en esta escena",
        });
    }

    const wasAlreadyFound = game.foundCharacters.some(
        (foundCharacter) => foundCharacter.characterId === character.id,
    );

    if (wasAlreadyFound) {
        return res.status(409).json({
        error: `${character.name} ya fue encontrado`,
        });
    }

    const isCorrect =
        x >= character.xMin &&
        x <= character.xMax &&
        y >= character.yMin &&
        y <= character.yMax;

    if (!isCorrect) {
        return res.json({
        correct: false,
        message: `Ahí no está ${character.name}`,
        });
    }

    await prisma.foundCharacter.create({
        data: {
        gameId: game.id,
        characterId: character.id,
        },
    });

    const totalCharacters = await prisma.character.count({
        where: {
        sceneId: game.sceneId,
        },
    });

    const foundCharacters = await prisma.foundCharacter.count({
        where: {
        gameId: game.id,
        },
    });

    const completed = foundCharacters === totalCharacters;

    let finishedGame = null;

    if (completed) {
        const finishedAt = new Date();
        const durationMs = finishedAt.getTime() - game.startedAt.getTime();

        finishedGame = await prisma.game.update({
        where: {
            id: game.id,
        },
        data: {
            completed: true,
            finishedAt,
            durationMs,
        },
        });
    }

    return res.json({
        correct: true,
        character: {
        id: character.id,
        name: character.name,
        imageUrl: character.imageUrl,
        },
        progress: {
        found: foundCharacters,
        total: totalCharacters,
        },
        completed,
        durationMs: finishedGame?.durationMs ?? null,
        message: completed
        ? "Encontraste a todos los personajes"
        : `Encontraste a ${character.name}`,
    });
}

export async function saveScore(req, res) {
    const { gameId } = req.params;
    const playerName = req.body.playerName?.trim();

    if (!playerName || playerName.length < 2 || playerName.length > 30) {
        return res.status(400).json({
        error: "El nombre debe tener entre 2 y 30 caracteres",
        });
    }

    const game = await prisma.game.findUnique({
        where: {
        id: gameId,
        },
    });

    if (!game) {
        return res.status(404).json({
        error: "Partida no encontrada",
        });
    }

    if (!game.completed || game.durationMs === null) {
        return res.status(400).json({
        error: "La partida todavía no ha terminado",
        });
    }

    const updatedGame = await prisma.game.update({
        where: {
        id: gameId,
        },
        data: {
        playerName,
        },
    });

    return res.json({
        message: "Puntuación guardada",
        score: {
        playerName: updatedGame.playerName,
        durationMs: updatedGame.durationMs,
        },
    });
}

export async function getLeaderboard(req, res) {
    const scores = await prisma.game.findMany({
        where: {
        completed: true,
        playerName: {
            not: null,
        },
        durationMs: {
            not: null,
        },
        },
        orderBy: {
        durationMs: "asc",
        },
        take: 10,
        select: {
        id: true,
        playerName: true,
        durationMs: true,
        finishedAt: true,
        },
    });

    return res.json(scores);
}