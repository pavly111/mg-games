import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { db } from '../firebase'

const auth = getAuth()

function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
      if (u) {
        localStorage.setItem('mg_admin', 'true')
      } else {
        localStorage.removeItem('mg_admin')
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setGames(data)
        setLoading(false)
      },
      (err) => {
        setError('Could not load games: ' + err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [user])

  async function handleLogin() {
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setError('')
    setSigningIn(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setPassword('')
    } catch {
      setError('Wrong email or password.')
    } finally {
      setSigningIn(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setGames([])
    setLoading(true)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this game?')) return
    setError('')
    try {
      await deleteDoc(doc(db, 'games', id))
    } catch (err) {
      setError('Error deleting game: ' + err.message)
    }
  }

  if (!authReady) {
    return (
      <div className="page">
        <p className="loading">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <div className="admin-login">
          <h1>Admin Access</h1>
          <p>Sign in to continue</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email..."
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password..."
            autoComplete="current-password"
          />
          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          <button onClick={handleLogin} disabled={signingIn}>
            {signingIn ? 'Signing in...' : 'Enter'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="admin-container">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-sub">{games.length} games in archive</p>
        <button className="delete-btn" onClick={handleLogout}>
          Log out
        </button>
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
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
