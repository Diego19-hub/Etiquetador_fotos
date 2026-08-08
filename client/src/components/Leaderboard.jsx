function Leaderboard({ leaderboard, formatDuration }) {
    if (leaderboard.length === 0) {
        return null;
    }

    return (
        <section className="leaderboard">
        <h2>Mejores tiempos</h2>

        <ol>
            {leaderboard.map((score, index) => (
            <li key={score.id}>
                <span>
                {index === 0 && "🥇 "}
                {index === 1 && "🥈 "}
                {index === 2 && "🥉 "}
                {score.playerName}
                </span>

                <strong>{formatDuration(score.durationMs)}</strong>
            </li>
            ))}
        </ol>
        </section>
    );
}

export default Leaderboard;