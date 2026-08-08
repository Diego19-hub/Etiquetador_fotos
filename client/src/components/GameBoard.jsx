function GameBoard({
    scene,
    characters,
    selectionBox,
    completed,
    validating,
    handleImageClick,
    handleCharacterSelection,
    closeSelectionBox,
    }) {
    return (
        <div className="image-container">
        <div className="game-image-wrapper">
            <img
            className="game-image"
            src={scene.imageUrl}
            alt={scene.name}
            onClick={handleImageClick}
            draggable="false"
            />

            {selectionBox && !completed && (
            <div
                className="selection-menu"
                style={{
                left: selectionBox.displayX,
                top: selectionBox.displayY,
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="target-box" />

                <div className="character-options">
                {characters.map((character) => (
                    <button
                    type="button"
                    key={character.id}
                    disabled={character.found || validating}
                    onClick={() => handleCharacterSelection(character)}
                    >
                    {character.name}
                    </button>
                ))}

                <button
                    type="button"
                    className="cancel-button"
                    onClick={closeSelectionBox}
                    disabled={validating}
                >
                    Cancelar
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}

export default GameBoard;