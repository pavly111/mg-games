import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

function Admin() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(
  localStorage.getItem('mg_admin') === 'true'
)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  function handleLogin() {
  if (password === ADMIN_PASSWORD) {
    setAuthenticated(true)
    localStorage.setItem('mg_admin', 'true')
  } else {
    alert('Wrong password!')
  }
}

  useEffect(() => {
    if (!authenticated) return
    const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setGames(data)
      setLoading(false)
    })
    return () => unsub()
  }, [authenticated])

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this game?')) return
    try {
      await deleteDoc(doc(db, 'games', id))
    } catch (err) {
      alert('Error deleting game: ' + err.message)
    }
  }

  if (!authenticated) {
    return (
      <div className="page">
        <div className="admin-login">
          <h1>Admin Access</h1>
          <p>Enter the admin password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password..."
          />
          <button onClick={handleLogin}>Enter</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="admin-container">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-sub">{games.length} games in archive</p>
        {loading && <p className="loading">Loading...</p>}
        <div className="admin-list">
          {games.map((game) => (
            <div key={game.id} className="admin-item">
              <div className="admin-item-info">
                {game.imageUrl && (
                  <img src={game.imageUrl} alt={game.name} className="admin-thumb" />
                )}
                <div>
                  <h3>{game.name}</h3>
                  <p>{game.category} • Added by {game.addedBy} • {game.date}</p>
                </div>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(game.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Admin