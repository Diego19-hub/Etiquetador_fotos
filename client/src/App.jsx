import { useEffect, useState } from "react";
import {
  startGame,
  validateCharacter,
  saveScore,
  getLeaderboard,
} from "./services/api.js";
import Header from "./components/Header.jsx";
import CharactersPanel from "./components/CharactersPanel.jsx";
import GameBoard from "./components/GameBoard.jsx";
import CompletionPanel from "./components/CompletionPanel.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import "./App.css";

function App() {
  const [gameId, setGameId] = useState(null);
  const [scene, setScene] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [durationMs, setDurationMs] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationPoint, setCalibrationPoint] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  async function createGame() {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setCompleted(false);
      setDurationMs(null);
      setElapsedSeconds(0);
      setSelectionBox(null);
      setValidating(false);
      setCalibrationMode(false);
      setCalibrationPoint(null);
      setPlayerName("");
      setScoreSaved(false);
      setStartedAt(null);

      const data = await startGame(1);

      setGameId(data.gameId);
      setScene(data.scene);
      setStartedAt(data.startedAt);

      setCharacters(
        data.scene.characters.map((character) => ({
          ...character,
          found: false,
        })),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeaderboard() {
    try {
      const scores = await getLeaderboard();
      setLeaderboard(scores);
    } catch (requestError) {
      console.error("Error cargando leaderboard:", requestError);
    }
  }

  useEffect(() => {
    createGame();
    loadLeaderboard();
  }, []);

  async function handleRestartGame() {
    await createGame();
    await loadLeaderboard();
  }

  useEffect(() => {
    if (!startedAt || completed) {
      return undefined;
    }

    function updateTimer() {
      const startTime = new Date(startedAt).getTime();
      const currentTime = Date.now();
      const differenceInSeconds = Math.floor(
        (currentTime - startTime) / 1000,
      );

      setElapsedSeconds(Math.max(0, differenceInSeconds));
    }

    updateTimer();

    const intervalId = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt, completed]);

  function handleImageClick(event) {
    if (completed || validating) {
      return;
    }

    const image = event.currentTarget;
    const rectangle = image.getBoundingClientRect();

    const clickX = event.clientX - rectangle.left;
    const clickY = event.clientY - rectangle.top;

    const normalizedX = clickX / rectangle.width;
    const normalizedY = clickY / rectangle.height;

    if (calibrationMode) {
      const point = {
        x: normalizedX,
        y: normalizedY,
      };

      setCalibrationPoint(point);
      return;
    }

    setSelectionBox({
      displayX: clickX,
      displayY: clickY,
      normalizedX,
      normalizedY,
    });

    setMessage("");
  }

  async function handleCharacterSelection(character) {
    if (!selectionBox || !gameId || character.found || validating) {
      return;
    }

    try {
      setValidating(true);
      setError("");

      const result = await validateCharacter(gameId, {
        characterId: character.id,
        x: selectionBox.normalizedX,
        y: selectionBox.normalizedY,
      });

      setMessage(result.message);

      if (result.correct) {
        setCharacters((currentCharacters) =>
          currentCharacters.map((currentCharacter) =>
            currentCharacter.id === result.character.id
              ? {
                  ...currentCharacter,
                  found: true,
                }
              : currentCharacter,
          ),
        );
      }

      if (result.completed) {
        setCompleted(true);
        setDurationMs(result.durationMs);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSelectionBox(null);
      setValidating(false);
    }
  }

  async function handleSaveScore(event) {
    event.preventDefault();

    try {
      setError("");

      await saveScore(gameId, playerName);
      setScoreSaved(true);

      const scores = await getLeaderboard();
      setLeaderboard(scores);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function closeSelectionBox() {
    setSelectionBox(null);
  }

  function formatDuration(milliseconds) {
    if (milliseconds === null) {
      return "";
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  function formatSeconds(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <main className="status-screen">
        <h1>Preparando la partida...</h1>
      </main>
    );
  }

  if (error && !scene) {
    return (
      <main className="status-screen">
        <h1>No se pudo iniciar el juego</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <div className="app">
      <Header
        completed={completed}
        durationMs={durationMs}
        elapsedSeconds={elapsedSeconds}
        formatDuration={formatDuration}
        formatSeconds={formatSeconds}
      />

      <main className="main-content">
        <CharactersPanel characters={characters} />

        <section className="game-section">
          <div className="game-instructions">
            <h2>{scene.name}</h2>

            <p>Haz clic sobre la imagen y selecciona el personaje.</p>

            <button
              type="button"
              className="calibration-button"
              onClick={() => {
                setCalibrationMode((current) => !current);
                setCalibrationPoint(null);
                setSelectionBox(null);
              }}
            >
              {calibrationMode
                ? "Desactivar calibración"
                : "Activar calibración"}
            </button>

            {calibrationMode && (
              <div className="calibration-panel">
                <strong>Modo calibración activo</strong>

                <p>
                  Haz clic en el centro de un personaje para obtener sus coordenadas.
                </p>

                {calibrationPoint && (
                  <div>
                    <p>
                      X: <code>{calibrationPoint.x.toFixed(4)}</code>
                    </p>

                    <p>
                      Y: <code>{calibrationPoint.y.toFixed(4)}</code>
                    </p>
                  </div>
                )}
              </div>
            )}

            {message && <p className="game-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {validating && (
              <p className="validating-message">Validando posición...</p>
            )}

            <CompletionPanel
              completed={completed}
              durationMs={durationMs}
              playerName={playerName}
              setPlayerName={setPlayerName}
              scoreSaved={scoreSaved}
              handleSaveScore={handleSaveScore}
              handleRestartGame={handleRestartGame}
              formatDuration={formatDuration}
            />

            <Leaderboard
              leaderboard={leaderboard}
              formatDuration={formatDuration}
            />
          </div>

          <GameBoard
            scene={scene}
            characters={characters}
            selectionBox={selectionBox}
            completed={completed}
            validating={validating}
            handleImageClick={handleImageClick}
            handleCharacterSelection={handleCharacterSelection}
            closeSelectionBox={closeSelectionBox}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
