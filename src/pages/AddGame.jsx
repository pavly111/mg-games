import { useState, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [ 'Puzzle', 'Team Game', 'Outdoor', 'Indoor']

function AddGame() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    materials: '',
    addedBy: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [voiceUrl, setVoiceUrl] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
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
      setImageUrl(data.secure_url)
    } catch {
      alert('Image upload failed')
    } finally {
      setImageLoading(false)
    }
  }

  async function startRecording() {
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

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch {
      alert('Microphone access denied. Please allow microphone access.')
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
    setVoiceLoading(true)
    const formData = new FormData()
    formData.append('file', audioBlob, 'voice-note.webm')
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      setVoiceUrl(data.secure_url)
      alert('Voice note uploaded successfully!')
    } catch {
      alert('Voice upload failed')
    } finally {
      setVoiceLoading(false)
    }
  }

  async function handleSubmit() {
    if (!form.name || !form.description || !form.addedBy) {
      alert('Please fill in name, description and your name')
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'games'), {
        ...form,
        imageUrl,
        voiceUrl,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp()
      })
      navigate('/')
    } catch (err) {
      alert('Error adding game: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="form-container">
        <h1 className="form-title">Add New Game</h1>
        <p className="form-sub">Share a game with the community</p>

        <div className="field">
          <label>Game Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter game name..."
          />
        </div>

        <div className="field">
          <label>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="How is the game played?..."
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
            placeholder="What do you need to play this game?..."
            rows={3}
          />
        </div>

        <div className="field">
          <label>Game Photo</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageLoading && <p className="uploading">Uploading image...</p>}
          {imageUrl && <img src={imageUrl} alt="preview" className="img-preview" />}
        </div>

        <div className="field">
          <label> Voice Note</label>
          <div className="recorder">
            {!recording ? (
              <button className="record-btn" onClick={startRecording}>
                 Start Recording
              </button>
            ) : (
              <button className="record-btn recording" onClick={stopRecording}>
                 Stop Recording
              </button>
            )}
            {audioBlob && !voiceUrl && (
              <>
                <audio controls src={URL.createObjectURL(audioBlob)} className="audio-preview" />
                <button className="upload-voice-btn" onClick={uploadVoice} disabled={voiceLoading}>
                  {voiceLoading ? 'Uploading...' : ' Upload Voice Note'}
                </button>
              </>
            )}
            {voiceUrl && <p className="uploaded"> Voice note uploaded!</p>}
          </div>
        </div>

        <div className="field">
          <label>Your Name *</label>
          <input
            value={form.addedBy}
            onChange={(e) => setForm({ ...form, addedBy: e.target.value })}
            placeholder="Your name..."
          />
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding Game...' : 'Add Game'}
        </button>
      </div>
    </div>
  )
}

export default AddGame