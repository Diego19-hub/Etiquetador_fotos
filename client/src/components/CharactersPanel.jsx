function CharactersPanel({ characters }) {
  return (
    <section className="characters-panel">
      <h2>Personajes</h2>

      <div className="characters-list">
        {characters.map((character) => (
          <article
            key={character.id}
            className={`character-card ${character.found ? "character-found" : ""}`}
          >
            <div className="character-avatar">
              {character.found ? "✓" : character.name.charAt(0)}
            </div>

            <div>
              <h3>{character.name}</h3>
              <p>{character.found ? "Encontrado" : "Sin encontrar"}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CharactersPanel;
