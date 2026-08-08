function Header({
    completed,
    durationMs,
    elapsedSeconds,
    formatDuration,
    formatSeconds,
}) {
    return (
        <header className="header">
        <div>
            <h1>¿Dónde está Wally?</h1>
            <p>Encuentra a todos los personajes ocultos.</p>
        </div>

        <div className="timer">
            <span>{completed ? "Tiempo final" : "Tiempo"}</span>

            <strong>
            {completed && durationMs !== null
                ? formatDuration(durationMs)
                : formatSeconds(elapsedSeconds)}
            </strong>

            <small>{completed ? "Completado" : "Jugando"}</small>
        </div>
        </header>
    );
}

export default Header;