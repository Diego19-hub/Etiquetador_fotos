import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const scene = await prisma.scene.upsert({
        where: {
        id: 1,
        },
        update: {
        name: "Escena principal",
        imageUrl: "/images/wally-scene.jpg",
        },
        create: {
        id: 1,
        name: "Escena principal",
        imageUrl: "/images/wally-scene.jpg",
        },
    });

    const characters = [
        {
        name: "Wally",
        imageUrl: "/images/characters/wally.png",
        xMin: 0.1965,
        xMax: 0.2465,
        yMin: 0.3493,
        yMax: 0.3993,
        },
        {
        name: "Wenda",
        imageUrl: "/images/characters/wenda.png",
        xMin: 0.2453,
        xMax: 0.2953,
        yMin: 0.3007,
        yMax: 0.3507,
        },
        {
        name: "Mago Barbablanca",
        imageUrl: "/images/characters/mago.png",
        xMin: 0.0000,
        xMax: 0.0494,
        yMin: 0.2594,
        yMax: 0.3094,
        }
    ];

    for (const character of characters) {
        await prisma.character.upsert({
        where: {
            sceneId_name: {
            sceneId: scene.id,
            name: character.name,
            },
        },
        update: character,
        create: {
            ...character,
            sceneId: scene.id,
        },
        });
    }

    console.log("Escena y personajes creados correctamente.");
}

main()
    .catch((error) => {
        console.error("Error al ejecutar la semilla:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });