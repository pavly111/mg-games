import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import { useParams, useNavigate } from 'react-router-dom'

const CATEGORIES = ['Treasure Hunt', 'Puzzle', 'Team Game', 'Outdoor', 'Indoor']

const auth = getAuth()

function extensionFor(type) {
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('ogg')) return 'ogg'
  return 'webm'
}

function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({})
  const [imageUrl, setImageUrl] = useState('')
  const [voiceUrl, setVoiceUrl] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setIsAdmin(!!u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!audioBlob) {
      setAudioPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(audioBlob)
    setAudioPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioBlob])

  useEffect(() => {
    async function fetchGame() {
      try {
        const docRef = doc(db, 'games', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() }
          setGame(data)
          setForm({
            name: data.name || '',
            description: data.description || '',
            category: data.category || CATEGORIES[0],
            materials: data.materials || '',
            addedBy: data.addedBy || '',
          })
          setImageUrl(data.imageUrl || '')
          setVoiceUrl(data.voiceUrl || '')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchGame()
  }, [id])

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setImageLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Upload failed')
      }
      setImageUrl(data.secure_url)
    } catch (err) {
      setError('Image upload failed: ' + err.message)
    } finally {
      setImageLoading(false)
    }
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : ''
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorder.start()
      setRecording(true)
    } catch {
      setError('Microphone access denied.')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  async function uploadVoice() {
    if (!audioBlob) return
    setError('')
    setVoiceLoading(true)
    const formData = new FormData()
    formData.append('file', audioBlob, 'voice-note.' + extensionFor(audioBlob.type))
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Upload failed')
      }
      setVoiceUrl(data.secure_url)
    } catch (err) {
      setError('Voice upload failed: ' + err.message)
    } finally {
      setVoiceLoading(false)
    }
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      await updateDoc(doc(db, 'games', id), {
        ...form,
        imageUrl: imageUrl || '',
        voiceUrl: voiceUrl || '',
      })
      setGame({ ...game, ...form, imageUrl, voiceUrl })
      setEditing(false)
    } catch (err) {
      setError('Could not save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-screen">Loading...</div>
  if (!game) return <div className="loading-screen">Game not found</div>

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="detail-container">
        {!editing ? (
          <>
            {game.imageUrl && (
              <img src={game.imageUrl} alt={game.name} className="detail-image" />
            )}
            <div className="detail-content">
              <div className="detail-top">
                <span className="game-category">{game.category}</span>
                <span className="game-date">{game.date}</span>
              </div>
              <h1 className="detail-title">{game.name}</h1>
              <p className="detail-author">Added by {game.addedBy}</p>
              <div className="detail-section">
                <h3>How to Play</h3>
                <p>{game.description}</p>
              </div>
              {game.materials && (
                <div className="detail-section">
                  <h3>Materials Needed</h3>
                  <p>{game.materials}</p>
                </div>
              )}
              {game.voiceUrl && (
                <div className="detail-section">
                  <h3>🎙️ Voice Note</h3>
                  <audio controls src={game.voiceUrl} className="audio-player" />
                </div>
              )}
              {isAdmin && (
                <button className="edit-game-btn" onClick={() => setEditing(true)}>
                  Edit Game
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="detail-content">
            <h2 className="edit-heading">Edit Game</h2>
            {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
            <div className="field">
              <label>Game Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
              />
            </div>
            <div className="field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Materials Needed</label>
              <textarea
                value={form.materials}
                onChange={(e) => setForm({ ...form, materials: e.target.value })}
                rows={3}
              />
            </div>
            <div className="field">
              <label>Game Photo</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imageLoading && <p className="uploading">Uploading...</p>}
              {imageUrl && <img src={imageUrl} alt="preview" className="img-preview" />}
            </div>
            <div className="field">
              <label>🎙️ Voice Note</label>
              <div className="recorder">
                {!recording ? (
                  <button className="record-btn" onClick={startRecording}>
                    🎙️ Start Recording
                  </button>
                ) : (
                  <button className="record-btn recording" onClick={stopRecording}>
                    ⏹️ Stop Recording
                  </button>
                )}
                {audioBlob && !voiceUrl && (
                  <>
                    <audio controls src={audioPreviewUrl} className="audio-preview" />
                    <button className="upload-voice-btn" onClick={uploadVoice} disabled={voiceLoading}>
                      {voiceLoading ? 'Uploading...' : '☁️ Upload Voice Note'}
                    </button>
                  </>
                )}
                {voiceUrl && <p className="uploaded">✅ Voice note ready</p>}
              </div>
            </div>
            <div className="edit-actions">
              <button className="submit-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameDetail
