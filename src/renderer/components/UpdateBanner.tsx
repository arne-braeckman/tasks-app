import { useState, useEffect } from 'react'
import { Download, RefreshCw, X, AlertCircle, ExternalLink, RotateCcw } from 'lucide-react'

interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  info?: { version: string; releaseNotes: string; releaseDate: string }
  progress?: { percent: number; bytesPerSecond: number; transferred: number; total: number }
  error?: string
  errorType?: 'read-only-volume' | 'no-space' | 'permission' | 'network' | 'unknown'
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
            <button
              onClick={() => setDismissed(true)}
              className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) transition-colors flex-shrink-0"
              style={{ padding: '4px' }}
            >
              <X size={14} strokeWidth={2} />
            </button>
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
          <div className="flex items-start gap-3">
            <AlertCircle size={14} className="text-(--color-priority-urgent) flex-shrink-0" strokeWidth={2} style={{ marginTop: '1px' }} />
            <div className="flex-1 min-w-0">
              <p className="text-(--color-text-primary) font-medium" style={{ fontSize: '13px', marginBottom: '4px' }}>
                Update failed: {status.error}
              </p>

              {/* Read-only volume specific help */}
              {status.errorType === 'read-only-volume' && (
                <div className="text-(--color-text-tertiary)" style={{ fontSize: '12px', lineHeight: '1.4', marginBottom: '8px' }}>
                  <p style={{ marginBottom: '4px' }}>📁 <strong>Solution:</strong> Move Tasks to Applications folder</p>
                  <ol style={{ marginLeft: '20px', marginTop: '4px' }}>
                    <li>Open Finder and locate the Tasks app</li>
                    <li>Drag it to the Applications folder</li>
                    <li>Try updating again</li>
                  </ol>
                </div>
              )}

              {/* Network error specific help */}
              {status.errorType === 'network' && (
                <p className="text-(--color-text-tertiary)" style={{ fontSize: '12px', marginBottom: '8px' }}>
                  🌐 Check your internet connection and try again.
                </p>
              )}

              {/* No space error specific help */}
              {status.errorType === 'no-space' && (
                <p className="text-(--color-text-tertiary)" style={{ fontSize: '12px', marginBottom: '8px' }}>
                  💾 Free up disk space and try again.
                </p>
              )}
            </div>

            {/* Retry option for network/stall errors */}
            {(status.errorType === 'network' || status.errorType === 'unknown') && (
              <button
                onClick={() => window.api?.updater.download()}
                className="flex items-center gap-1 rounded-lg border border-(--color-border-subtle) text-(--color-text-secondary) font-medium transition-opacity hover:opacity-80 flex-shrink-0"
                style={{ fontSize: '12px', padding: '6px 10px' }}
                title="Retry download"
              >
                <RotateCcw size={12} strokeWidth={2} />
                Retry
              </button>
            )}

            {/* Manual download option */}
            {status.info?.version && (
              <button
                onClick={() => {
                  const url = `https://github.com/arne-braeckman/tasks-app/releases/tag/v${status.info!.version}`
                  if (window.api) {
                    window.api.shell.openExternal(url)
                  } else {
                    window.open(url, '_blank')
                  }
                }}
                className="flex items-center gap-1 rounded-lg bg-(--color-accent) text-(--color-surface) font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                style={{ fontSize: '12px', padding: '6px 10px' }}
                title="Download manually from GitHub"
              >
                <Download size={12} strokeWidth={2} />
                <ExternalLink size={11} strokeWidth={2} />
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) transition-colors flex-shrink-0"
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
