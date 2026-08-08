function CompletionPanel({
    completed,
    durationMs,
    playerName,
    setPlayerName,
    scoreSaved,
    handleSaveScore,
    handleRestartGame,
    formatDuration,
    }) {
    if (!completed) {
        return null;
    }

    return (
        <div className="completion-message">
        <h3>¡Partida completada!</h3>

        <p>
            Tiempo registrado:{" "}
            <strong>{formatDuration(durationMs)}</strong>
        </p>

        {!scoreSaved ? (
            <form className="score-form" onSubmit={handleSaveScore}>
            <label htmlFor="playerName">Guarda tu puntuación</label>

            <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Tu nombre"
                minLength="2"
                maxLength="30"
                required
            />

            <button type="submit">Guardar resultado</button>
            </form>
        ) : (
            <p>✓ Resultado guardado</p>
        )}

        <button
            type="button"
            className="restart-button"
            onClick={handleRestartGame}
        >
            Jugar otra vez
        </button>
        </div>
    );
}

export default CompletionPanel;