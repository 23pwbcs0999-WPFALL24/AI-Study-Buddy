import { useState, useEffect } from 'react'

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  category: string
  createdAt: string
  updatedAt: string
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '', category: 'personal' })

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    if (!token || !newNote.title || !newNote.content) return
    setLoading(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newNote,
          tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })
      const data = await res.json()
      if (res.ok) {
        setNotes([data.note, ...notes])
        setNewNote({ title: '', content: '', tags: '', category: 'personal' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateNote = async () => {
    if (!token || !currentNote) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notes/${currentNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentNote)
      })
      const data = await res.json()
      if (res.ok) {
        setNotes(notes.map(note => note._id === currentNote._id ? data.note : note))
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating note:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this note?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotes(notes.filter(note => note._id !== noteId))
        if (currentNote?._id === noteId) {
          setCurrentNote(null)
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    } finally {
      setLoading(false)
    }
  }

  // const uploadFile = async () => {
  //   if (!file || !token) return
  //   setUploadLoading(true)
  //   try {
  //     const form = new FormData()
  //     form.append("file", file)
  //     const res = await fetch("/api/files/upload", {
  //       method: "POST",
  //       headers: { Authorization: `Bearer ${token}` },
  //       body: form,
  //     })
  //     const data = await res.json()
  //     if (!res.ok) throw new Error(data?.message || "Upload failed")

  //     // Create a note from the uploaded content
  //     // const res2 = await fetch('/api/notes', {
  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Content-Type': 'application/json',
  //     //     Authorization: `Bearer ${token}`
  //     //   },
  //     //   body: JSON.stringify({
  //     //     title: file.name,
  //     //     content: data.extractedText || 'Uploaded file content',
  //     //     category: 'uploaded',
  //     //     tags: ['uploaded', file.type.split('/')[1] || 'file']
  //     //   })
  //     // })
  //     const res2 = await fetch('/api/notes', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`
  //       },
  //       body: JSON.stringify({
  //         title: file.name,
  //         content: data.extractedText && data.extractedText.trim().length > 0
  //           ? data.extractedText
  //           : `Uploaded file: ${file.name}`,   // fallback content
  //         category: 'uploaded',
  //         tags: ['uploaded', file.type.split('/')[1] || 'file']
  //       })
  //     })

  //     const noteData = await res2.json()
  //     if (res2.ok) {
  //       setNotes([noteData.note, ...notes])
  //       setFile(null)
  //       alert('File uploaded and note created successfully!')
  //     }
  //   } catch (err: any) {
  //     alert(err.message)
  //   } finally {
  //     setUploadLoading(false)
  //   }
  // }
const uploadFile = async () => {
  if (!file || !token) return
  setUploadLoading(true)
  try {
    const form = new FormData()
    form.append("file", file)

    const res = await fetch("/api/files/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || "Upload failed")

    // 👉 Use the note created by the backend
    if (data?.note) {
      setNotes(prev => [data.note, ...prev])
      setCurrentNote(data.note) // optional: auto-open the new note
    }

    setFile(null)
    alert("File uploaded and note created successfully!")
  } catch (err: any) {
    alert(err.message)
  } finally {
    setUploadLoading(false)
  }
}

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'personal', 'academic', 'work', 'ideas', 'uploaded']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notes</h1>
          <p className="text-white/60 mt-1">Organize and manage your study materials</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="button bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
        >
          📝 Create Note
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Search & Filter</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">Search Notes</label>
            <input
              type="text"
              placeholder="Search by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload File</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-white/80 mb-2 block">Select File (PDF, DOCX, TXT)</label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
          </div>
          <button
            onClick={uploadFile}
            disabled={!file || uploadLoading}
            className="button bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {uploadLoading ? '⏳ Uploading...' : '📤 Upload & Create Note'}
          </button>
        </div>
        {file && (
          <p className="text-sm text-white/60 mt-2">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Create Note Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Note</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              placeholder="Note content..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <input
                type="text"
                placeholder="Tags (comma separated)..."
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createNote}
                disabled={loading || !newNote.title || !newNote.content}
                className="button bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Note'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="button bg-white/10 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Notes List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Your Notes ({filteredNotes.length})</h3>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`card p-4 cursor-pointer transition-all hover:scale-[1.02] ${currentNote?._id === note._id ? 'ring-2 ring-purple-500 bg-white/10' : ''
                    }`}
                  onClick={() => setCurrentNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{note.title}</h4>
                      <p className="text-sm text-white/60 line-clamp-2">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                          {note.category}
                        </span>
                        {note.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-white/40">+{note.tags.length - 3}</span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-2">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentNote(note)
                          setIsEditing(true)
                        }}
                        className="p-1 text-white/60 hover:text-white"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNote(note._id)
                        }}
                        className="p-1 text-white/60 hover:text-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-white/60">
              <div className="text-4xl mb-2">📝</div>
              <p>No notes found</p>
              <p className="text-sm">Create your first note to get started</p>
            </div>
          )}
        </div>

        {/* Note Editor */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {currentNote ? (isEditing ? 'Edit Note' : 'View Note') : 'Select a Note'}
          </h3>
          {currentNote ? (
            <div className="card p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={currentNote.title}
                    onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <textarea
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={updateNote}
                      disabled={loading}
                      className="button bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="button bg-white/10 hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">{currentNote.title}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/80 whitespace-pre-wrap">{currentNote.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                      {currentNote.category}
                    </span>
                    {currentNote.tags.map((tag, i) => (
                      <span key={i} className="text-sm px-2 py-1 rounded-full bg-white/10 text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-white/40">
                    Created: {new Date(currentNote.createdAt).toLocaleString()}
                    <br />
                    Updated: {new Date(currentNote.updatedAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="button bg-purple-600 hover:bg-purple-700"
                  >
                    ✏️ Edit Note
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-white/60">
              <div className="text-4xl mb-2">📄</div>
              <p>Select a note from the list to view or edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


