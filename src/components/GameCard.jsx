import { useNavigate } from 'react-router-dom'

function GameCard({ game }) {
  const navigate = useNavigate()

  return (
    <div className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
      {game.imageUrl ? (
        <img src={game.imageUrl} alt={game.name} className="game-image" />
      ) : (
        <div className="game-image-placeholder">
  <img src="/logo.png" alt="MG Games" className="placeholder-logo" />
</div>
      )}
      <div className="game-info">
        <div className="game-header">
          <span className="game-category">{game.category}</span>
        </div>
        <h3 className="game-name">{game.name}</h3>
        <p className="game-desc">{game.description.slice(0, 100)}...</p>
        <div className="game-footer">
          <span className="game-author">By {game.addedBy}</span>
          <span className="game-date">{game.date}</span>
        </div>
      </div>
    </div>
  )
}

export default GameCard