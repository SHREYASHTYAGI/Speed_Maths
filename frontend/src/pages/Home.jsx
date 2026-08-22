import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const categories = ['addition', 'subtraction', 'multiplication', 'division', 'percentage']
const difficulties = ['easy', 'medium', 'hard']
const modes = ['stopwatch', 'timer']
const timerOptions = [300, 600, 900]

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState({
    mode: 'stopwatch',
    category: 'addition',
    difficulty: 'easy',
    timeLimit: 300,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/practice/start', settings)
      navigate('/practice', {
        state: {
          sessionId: response.data.sessionId,
          question: response.data.question,
          settings,
          username: user?.username,
        },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start practice session')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">Fast Maths</div>
            <h1 className="mt-2 text-2xl font-bold text-white">Practice faster. Improve your accuracy.</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
              {user?.username || 'Player'}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <div className="space-y-7">
              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">Mode</p>
                <div className="grid grid-cols-2 gap-3">
                  {modes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSettings((previous) => ({ ...previous, mode }))}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium capitalize transition ${
                        settings.mode === mode
                          ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">Category</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSettings((previous) => ({ ...previous, category }))}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium capitalize transition ${
                        settings.category === category
                          ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">Difficulty</p>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => setSettings((previous) => ({ ...previous, difficulty }))}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                        settings.difficulty === difficulty
                          ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {settings.mode === 'timer' && (
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-300">Timer</p>
                  <div className="grid grid-cols-3 gap-3">
                    {timerOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSettings((previous) => ({ ...previous, timeLimit: item }))}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          settings.timeLimit === item
                            ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-200'
                            : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {item / 60} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Selected challenge</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold capitalize text-white">{settings.category}</span>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                    {settings.difficulty}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Mode</p>
                <p className="mt-2 text-xl font-semibold capitalize text-white">{settings.mode}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {settings.mode === 'timer' ? `Time limit: ${settings.timeLimit / 60} minutes` : 'Stopwatch practice'}
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleStart}
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-base font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Starting...' : 'Start Practice'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Home
