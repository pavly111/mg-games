import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import GameCard from '../components/GameCard'

const CATEGORIES = ['All', 'Puzzle', 'Team Game', 'Outdoor', 'Indoor']

function Home() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setGames(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = games.filter((game) => {
    const matchCategory = activeCategory === 'All' || game.category === activeCategory
    const matchSearch = game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="page">
      <div className="home-hero">
        <h1 className="hero-title">Game Archive</h1>
      </div>

      <div className="search-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
          className="search-input"
        />
      </div>

      <div className="categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className="loading">Loading games...</p>}

      {!loading && filtered.length === 0 && (
        <p className="empty">No games found.</p>
      )}

      <div className="games-grid">
        {filtered.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

export default Home