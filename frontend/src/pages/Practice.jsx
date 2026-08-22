import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Practice() {
  const navigate = useNavigate()
  const location = useLocation()
  const sessionInfo = location.state || {}
  const [question, setQuestion] = useState(sessionInfo.question || '')
  const [answer, setAnswer] = useState('')
  const [questionsSolved, setQuestionsSolved] = useState(0)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isFinished, setIsFinished] = useState(false)
  const [sessionId] = useState(sessionInfo.sessionId || '')
  const [settings] = useState(sessionInfo.settings || { mode: 'stopwatch', timeLimit: 0 })

  const timeLimit = settings.timeLimit || 0
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
  if (!sessionId || isFinished) {
    return
  }

  const interval = setInterval(() => {
    if (settings.mode === 'timer') {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          setIsFinished(true)
          handleStop(false)
          return 0
        }

        return previous - 1
      })
    } else {
      setElapsedSeconds((previous) => previous + 1)
    }
  }, 1000)

  return () => clearInterval(interval)
}, [sessionId, settings.mode, navigate, isFinished])

  const formattedTime = useMemo(() => {
    const totalSeconds = settings.mode === 'timer' ? timeRemaining : elapsedSeconds
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [elapsedSeconds, settings.mode, timeRemaining])

  const handleStop = async (manual = true) => {
    if (!sessionId) return

    try {
      await api.post('/practice/stop', { sessionId })
      if (manual) {
        setFeedback({ type: 'info', message: 'Session stopped' })
      }
      setIsFinished(true)
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to stop session' })
    }
  }

  const handleAnswer = async (event) => {
    event.preventDefault()

    if (!sessionId || (!answer && answer !== 0)) {
      return
    }

    try {
      const response = await api.post('/practice/answer', { sessionId, answer: Number(answer) })

      if (!response.data.correct) {
        setFeedback({ type: 'error', message: 'Wrong answer. Same question remains.' })
        setAnswer('')
        return
      }

      setQuestionsSolved(response.data.questionsSolved)
      setQuestion(response.data.question)
      setAnswer('')
      setFeedback({ type: 'success', message: 'Correct! New question ready.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to submit answer' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">Fast Maths</div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-300">
            Time: <span className="font-semibold text-white">{formattedTime}</span>
          </div>
        </header>

        <main className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm md:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 text-2xl font-semibold text-slate-300">Question</div>
            <div className="mb-8 text-4xl font-bold tracking-tight text-white sm:text-5xl">{question}</div>

            <form onSubmit={handleAnswer} className="mx-auto w-full max-w-lg space-y-5">
              <input
                type="number"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={isFinished}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-center text-2xl font-semibold text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Type your answer"
                autoFocus
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isFinished}
                  className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-base font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => handleStop(true)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-base font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                >
                  Stop Practice
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-400">
              <span className="font-medium text-slate-300">Solved:</span>
              <span className="text-lg font-semibold text-white">{questionsSolved}</span>
            </div>

            {feedback.message && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : feedback.type === 'error'
                      ? 'border-red-500/30 bg-red-500/10 text-red-300'
                      : 'border-slate-700 bg-slate-950 text-slate-300'
                }`}
              >
                {feedback.message}
              </div>
            )}

            {isFinished && (
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="mt-6 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20"
              >
                Back to home
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Practice
