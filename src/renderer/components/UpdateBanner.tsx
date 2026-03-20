import { useState, useEffect } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'

interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  info?: { version: string; releaseNotes: string; releaseDate: string }
  progress?: { percent: number; bytesPerSecond: number; transferred: number; total: number }
  error?: string
}

export default function UpdateBanner() {
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!window.api?.updater) return
    const unsub = window.api.updater.onStatus((s: UpdateStatus) => {
      setStatus(s)
      setDismissed(false)
    })
    return unsub
  }, [])

  // Auto-dismiss errors after 5s
  useEffect(() => {
    if (status?.state === 'error') {
      const t = setTimeout(() => setDismissed(true), 5000)
      return () => clearTimeout(t)
    }
  }, [status?.state])

  if (!status || dismissed) return null
  if (['idle', 'checking', 'not-available'].includes(status.state)) return null

  return (
    <div
      className="fixed left-0 right-0 z-[9998] flex items-center justify-center"
      style={{ top: '38px' }}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-xl border border-(--color-border-subtle) bg-(--color-surface) shadow-lg"
        style={{ padding: '12px 16px' }}
      >
        {status.state === 'available' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-(--color-text-primary) font-medium" style={{ fontSize: '13px' }}>
                Version {status.info?.version} is available
              </p>
              {status.info?.releaseNotes && (
                <p className="text-(--color-text-tertiary) truncate mt-0.5" style={{ fontSize: '12px' }}>
                  {status.info.releaseNotes.replace(/<[^>]*>/g, '').slice(0, 100)}
                </p>
              )}
            </div>
            <button
              onClick={() => window.api?.updater.download()}
              className="flex items-center gap-1.5 rounded-lg bg-(--color-accent) text-(--color-surface) font-medium transition-opacity hover:opacity-90"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Download size={12} strokeWidth={2} />
              Download
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) transition-colors"
              style={{ padding: '4px' }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {status.state === 'downloading' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-(--color-text-primary) font-medium" style={{ fontSize: '13px' }}>
                Downloading update…
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-(--color-border-subtle) overflow-hidden">
                <div
                  className="h-full rounded-full bg-(--color-accent) transition-all duration-300"
                  style={{ width: `${Math.round(status.progress?.percent ?? 0)}%` }}
                />
              </div>
            </div>
            <span className="text-(--color-text-tertiary) flex-shrink-0" style={{ fontSize: '12px' }}>
              {Math.round(status.progress?.percent ?? 0)}%
            </span>
          </div>
        )}

        {status.state === 'downloaded' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-(--color-text-primary) font-medium" style={{ fontSize: '13px' }}>
                Update ready — restart to install v{status.info?.version}
              </p>
            </div>
            <button
              onClick={() => window.api?.updater.install()}
              className="flex items-center gap-1.5 rounded-lg bg-(--color-accent) text-(--color-surface) font-medium transition-opacity hover:opacity-90"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <RefreshCw size={12} strokeWidth={2} />
              Restart Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) transition-colors"
              style={{ padding: '4px' }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {status.state === 'error' && (
          <div className="flex items-center gap-3">
            <p className="flex-1 text-(--color-text-secondary)" style={{ fontSize: '13px' }}>
              Update error: {status.error}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) transition-colors"
              style={{ padding: '4px' }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
