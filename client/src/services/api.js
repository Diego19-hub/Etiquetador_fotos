const API_URL = "http://localhost:3000/api";

export async function startGame(sceneId = 1) {
    const response = await fetch(`${API_URL}/games`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ sceneId }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "No se pudo iniciar la partida");
    }

    return data;
}

export async function validateCharacter(gameId, selection) {
    const response = await fetch(`${API_URL}/games/${gameId}/validate`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(selection),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "No se pudo validar el personaje");
    }

    return data;
}

export async function saveScore(gameId, playerName) {
    const response = await fetch(`${API_URL}/games/${gameId}/score`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        playerName,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar el resultado");
    }

    return data;
}

export async function getLeaderboard() {
    const response = await fetch(`${API_URL}/games/leaderboard`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener el ranking");
    }

    return data;
}