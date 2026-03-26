import { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Upload,
  X,
  Settings2,
  Check,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  ChevronRight,
  Download,
  Infinity as InfinityIcon
} from 'lucide-react'

function App() {
  // --- States ---
  const [healthStatus, setHealthStatus] = useState('checking')
  const [currentWord, setCurrentWord] = useState('flashcards')
  const [isVisible, setIsVisible] = useState(true)

  // App Logic States
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle, configuring, generating, reviewing
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false)
  const [cards, setCards] = useState([])
  const [deckName, setDeckName] = useState('IATOMFARM Deck')
  const [error, setError] = useState(null)

  // Configuration States
  const [settings, setSettings] = useState({
    format: 'csv',
    cardCount: 20,
    includeEnumeration: false,
    coverEverything: false
  })

  // --- Effects ---

  // Heading Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentWord(prev => prev === 'flashcards' ? 'reviewers' : 'flashcards')
        setIsVisible(true)
      }, 700)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Health Check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health')
        setHealthStatus(response.ok ? 'connected' : 'error')
      } catch {
        setHealthStatus('disconnected')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  // --- Handlers ---

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setIsModalOpen(true)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (
      droppedFile.type === 'application/pdf' ||
      droppedFile.name.endsWith('.docx') ||
      droppedFile.name.endsWith('.pptx') ||
      droppedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )) {
      setFile(droppedFile)
      setIsModalOpen(true)
    }
  }, [])

  const handleGenerate = async () => {
    if (!file) return

    setIsModalOpen(false)
    setStatus('generating')
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    // If coverEverything is true, we send 0 to indicate no limit to the backend
    formData.append('card_count', settings.coverEverything ? 0 : settings.cardCount)
    formData.append('include_enumeration', settings.includeEnumeration)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate cards')
      }

      setCards(data.cards)
      setDeckName(file.name.split('.')[0] || 'IATOMFARM Deck')
      setStatus('reviewing')
    } catch (err) {
      console.error('Upload Error:', err)
      setError(err.message)
      setStatus('idle')
    }
  }

  const handleExport = async () => {
    if (cards.length === 0) return

    try {
      const response = await fetch(`/api/export/${settings.format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cards,
          deck_name: deckName
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const extension = settings.format === 'apkg' ? 'apkg' :
        settings.format === 'docx' ? 'docx' :
          settings.format === 'pdf' ? 'pdf' : 'csv'
      a.download = `iatomfarm_export.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export. Please try again.')
    }
  }

  const handleCardUpdate = (index, field, value) => {
    const newCards = [...cards]
    newCards[index][field] = value
    setCards(newCards)
  }

  const handleDeleteCard = (index) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const resetApp = () => {
    setFile(null)
    setCards([])
    setStatus('idle')
    setError(null)
  }

  // --- Render Helpers ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 leading-normal overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={resetApp}>
            <h1 className="text-2xl font-display font-black tracking-tighter leading-none mb-1">IATOMFARM</h1>
            <p className="text-[10px] text-slate-400 font-medium leading-none uppercase tracking-wider hidden sm:block">
              <span className="font-bold text-brand">I</span> <span className="font-bold text-slate-600">A</span>m <span className="font-bold text-slate-600">T</span>ired <span className="font-bold text-slate-600">O</span>f <span className="font-bold text-slate-600">M</span>aking <span className="font-bold text-slate-600">F</span>lashcards <span className="font-bold text-slate-600">a</span>nd <span className="font-bold text-slate-600">R</span>eviewers <span className="font-bold text-slate-600">M</span>anually
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLimitModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Find out the limits</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:py-8 lg:py-12 w-full relative flex flex-col justify-center">
        {status === 'idle' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
              {/* Left Side: Branding & Info */}
              <div className="text-center lg:text-left lg:max-w-xl">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                  Stop making <span className={`text-brand transition-opacity duration-700 inline-block min-w-[200px] md:min-w-[240px] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>{currentWord}</span> <br /> the hard way.
                </h2>
                <p className="text-base sm:text-xl text-slate-500 font-medium leading-relaxed">
                  Upload your study materials and let Gemini build your deck in seconds.
                  Automated identification and enumeration reviewer generation. Export in CSV, DOCX, PDF, or APKG format.
                </p>
              </div>

              {/* Right Side: Upload Zone */}
              <div className="w-full max-w-lg relative px-2 sm:px-0 shrink-0">
                <label className="block aspect-square lg:aspect-[4/3] bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 sm:p-10 transition-all hover:border-brand/40 hover:bg-brand/[0.01] group cursor-pointer shadow-sm">
                  <input type="file" className="hidden" accept=".pdf,.docx,.pptx" onChange={handleFileChange} />
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand/10 group-hover:scale-110 transition-all duration-300">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand transition-colors" />
                  </div>
                  <p className="text-slate-900 text-xl font-bold mb-2 text-center leading-tight">Drop your lecture here</p>
                  <p className="text-slate-400 font-medium text-center px-4 text-sm leading-relaxed">Support PDF, DOCX, and PPTX files. Best results with text-heavy documents.</p>
                </label>

                {file && (
                  <div className="mt-8 p-4 bg-brand/5 border border-brand/10 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-lg shadow-brand/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-[150px]">{file.name}</p>
                        <p className="text-xs text-brand font-bold uppercase tracking-widest leading-none">Ready</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-brand/20 whitespace-nowrap text-sm"
                    >
                      Proceed <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-12 max-w-xl mx-auto p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-medium text-center animate-in shake duration-300">
                {error}
              </div>
            )}
          </div>
        )}

        {status === 'generating' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-brand animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-3 tracking-tight">AI is reading your document...</h3>
            <p className="text-slate-500 font-medium max-w-md px-4 text-sm sm:text-base">Extracting key concepts, terms, and mechanism. This usually takes 10-20 seconds.</p>
          </div>
        )}

        {status === 'reviewing' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2 sm:px-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight leading-none mb-1">Generated Cards</h3>
                <div className="flex items-center gap-2 text-slate-500 group">
                  <span className="text-xs font-black uppercase tracking-widest shrink-0">Deck Name:</span>
                  <input 
                    type="text" 
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="bg-transparent border-none p-0 font-bold text-brand focus:ring-0 text-sm w-full outline-none hover:bg-brand/5 rounded px-1 transition-colors"
                    placeholder="Enter deck name..."
                  />
                  <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={resetApp} className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                  Discard
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none bg-brand text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand/20"
                >
                  <Download className="w-5 h-5" /> Export {settings.format.toUpperCase()}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm mx-2 sm:mx-0">
              {/* Header - Hidden on Mobile */}
              <div className="hidden md:grid grid-cols-[50px,1fr,1fr,80px] bg-slate-50 border-b border-slate-200 px-6 py-4">
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">#</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Front (Question)</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Back (Answer)</div>
                <div className="text-right"></div>
              </div>

              <div className="divide-y divide-slate-100">
                {cards.map((card, idx) => (
                  <div key={idx} className="group relative flex flex-col md:grid md:grid-cols-[50px,1fr,1fr,80px] px-4 md:px-6 py-4 md:py-6 hover:bg-slate-50/50 transition-colors gap-3 md:gap-0">
                    {/* Numbering */}
                    <div className="md:flex items-center text-sm font-black text-slate-300">
                      <span className="md:hidden text-[10px] uppercase tracking-wider text-slate-400 mr-2">Item</span>
                      #{idx + 1}
                    </div>

                    <div className="md:pr-10">
                      <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Question</div>
                      <textarea
                        value={card.question}
                        onChange={(e) => handleCardUpdate(idx, 'question', e.target.value)}
                        className="w-full bg-transparent resize-none font-medium text-slate-700 focus:outline-none focus:text-slate-900 border-none p-0 focus:ring-0 leading-relaxed active:bg-slate-100 rounded"
                        rows={2}
                      />
                    </div>

                    <div className="md:pr-6 md:border-l md:border-slate-100 h-full">
                      <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Answer</div>
                      <textarea
                        value={card.answer}
                        onChange={(e) => handleCardUpdate(idx, 'answer', e.target.value)}
                        className="w-full bg-transparent resize-none font-bold text-slate-900 focus:outline-none border-none p-0 md:pl-10 focus:ring-0 leading-relaxed md:min-h-[auto]"
                        rows={1}
                      />
                    </div>

                    <div className="flex items-center justify-end md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 md:static">
                      <button
                        onClick={() => handleDeleteCard(idx)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 leading-none mb-1">Configure</h3>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm truncate">Fine-tune your study material.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 sm:w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Output Format */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Export Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['csv', 'docx', 'pdf', 'apkg'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSettings({ ...settings, format: f })}
                      className={`py-2.5 sm:py-3 px-2 rounded-2xl border-2 font-bold uppercase text-[10px] sm:text-xs transition-all ${settings.format === f
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Everything / Free Quantity */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${settings.coverEverything ? 'bg-brand/10 text-brand' : 'bg-slate-200 text-slate-400'}`}>
                    <InfinityIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm sm:text-base">Free Quantity</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">Cover every detail in the module</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, coverEverything: !settings.coverEverything })}
                  className={`relative w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors duration-200 focus:outline-none ${settings.coverEverything ? 'bg-brand' : 'bg-slate-200'
                    }`}
                >
                  <div className={`absolute top-1 left-1 w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full transition-transform duration-200 transform ${settings.coverEverything ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                    } shadow-sm`} />
                </button>
              </div>

              {/* Card Count Slider */}
              <div className={`space-y-4 transition-opacity duration-300 ${settings.coverEverything ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Max Cards</label>
                  <span className="text-brand font-black text-sm">{settings.cardCount} items</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  disabled={settings.coverEverything}
                  value={settings.cardCount}
                  onChange={(e) => setSettings({ ...settings, cardCount: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              {/* Enumeration Toggle */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">Include Enumeration</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">Generate list-based questions</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, includeEnumeration: !settings.includeEnumeration })}
                  className={`relative w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors duration-200 focus:outline-none ${settings.includeEnumeration ? 'bg-brand' : 'bg-slate-200'
                    }`}
                >
                  <div className={`absolute top-1 left-1 w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full transition-transform duration-200 transform ${settings.includeEnumeration ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                    } shadow-sm`} />
                </button>
              </div>

              <div className="pt-2 sm:pt-4">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-brand text-white py-3.5 sm:py-4 rounded-[1.5rem] font-black tracking-tight text-base sm:text-lg shadow-xl shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  Spark AI Generation <Check className="w-5 h-5 sm:w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Limits Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsLimitModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm sm:max-w-md rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 overflow-y-auto max-h-[90vh] text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-brand" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 mb-2 sm:mb-4 tracking-tight leading-none">API Limits</h3>
            <p className="text-slate-500 font-medium mb-6 sm:mb-8 leading-relaxed text-[11px] sm:text-sm">
              IATOMFARM uses the free Gemini API tier. This means there are fixed usage quotas that we cannot exceed:
            </p>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[
                { label: 'RPM', value: '15 Req / Min', icon: Activity },
                { label: 'TPM', value: '1,000,000 Tokens', icon: FileText },
                { label: 'RPD', value: '1,500 Req / Day', icon: ShieldCheck }
              ].map((limit, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{limit.label}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700">{limit.value}</span>
                </div>
              ))}
            </div>

            <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl text-amber-800 text-[10px] sm:text-xs font-medium leading-relaxed mb-6 sm:mb-8">
              If generation fails or is stuck, the limits might have been consumed. 
              Increased limits are not possible without funding.
            </div>

            <button 
              onClick={() => setIsLimitModalOpen(false)}
              className="w-full bg-slate-900 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black tracking-tight text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-3 border-t border-slate-200 mt-auto bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase leading-relaxed">
            Built with Gemini-3-Flash • IATOMFARM © 2026<br className="sm:hidden" />
            <span className="hidden sm:inline"> • </span>
            Christopher A. Quinto
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
