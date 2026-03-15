import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPipeline, sendWebhook, getJobs } from '../lib/api'
import type { Pipeline, Job } from '../types'
import StatusBadge from '../components/StatusBadge'
import JsonViewer from '../components/JsonViewer'

// Default payload shown in the test webhook form
const DEFAULT_PAYLOAD = JSON.stringify(
  { event: 'test_event', data: { message: 'Hello!' } },
  null,
  2
)

export default function PipelinePage() {
  const { id } = useParams<{ id: string }>()

  const [pipeline, setPipeline]     = useState<Pipeline | null>(null)
  const [jobs, setJobs]             = useState<Job[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [payload, setPayload]       = useState(DEFAULT_PAYLOAD)
  const [payloadError, setPayloadError] = useState('')
  const [sending, setSending]       = useState(false)
  const [sendResult, setSendResult] = useState<{ jobId: string; status: string } | null>(null)
  const [copied, setCopied]         = useState(false)
  const [success, setSuccess]       = useState('')
  const [toastError, setToastError] = useState('')

  // Show a temporary toast notification (auto-dismisses after 3 seconds)
  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setToastError(msg)
      setTimeout(() => setToastError(''), 3000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  // Load pipeline details and its recent jobs.
  // Defined inside useEffect to avoid the react-hooks/exhaustive-deps warning.
  useEffect(() => {
    if (!id) {
      setError('Missing pipeline ID')
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        // Fetch pipeline and jobs in parallel for faster load
        const [p, j] = await Promise.all([
          getPipeline(id),
          getJobs({ limit: 50 }),
        ])
        setPipeline(p)
        // Filter jobs client-side since there's no dedicated /pipelines/:id/jobs endpoint
        setJobs(j.jobs.filter((job: Job) => job.pipelineId === id))
      } catch {
        setError('Failed to load pipeline')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [id])

  // Copy the full webhook URL to the clipboard
  const handleCopy = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/webhooks/${pipeline?.sourceKey}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Failed to copy webhook URL', true)
    }
  }

  // Send a test webhook to this pipeline and show the resulting job ID
  const handleSendWebhook = async () => {
    if (!pipeline) return

    // Validate JSON before sending
    let parsedPayload: Record<string, unknown>
    try {
      parsedPayload = JSON.parse(payload)
    } catch {
      setPayloadError('Invalid JSON payload')
      return
    }

    setPayloadError('')
    setSending(true)
    setSendResult(null)

    try {
      const result = await sendWebhook(pipeline.sourceKey, parsedPayload)
      setSendResult(result)
      showToast('Webhook sent successfully!')

      // Refresh the jobs list after a short delay to give the worker time to pick up the job
      setTimeout(() => {
        getJobs({ limit: 50 })
          .then(j => {
            setJobs(j.jobs.filter((job: Job) => job.pipelineId === id))
          })
          .catch(() => null)
      }, 2000)

    } catch {
      showToast('Failed to send webhook', true)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error || !pipeline) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
        ❌ {error || 'Pipeline not found'}
      </div>
    )
  }

  const webhookUrl = `${import.meta.env.VITE_API_URL}/webhooks/${pipeline.sourceKey}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/pipelines" className="text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{pipeline.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{pipeline.processingType}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
          pipeline.isActive
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-gray-700 text-gray-400'
        }`}>
          {pipeline.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Toast notifications */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}
      {toastError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          ❌ {toastError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pipeline Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pipeline Info</h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Pipeline ID</p>
              <p className="font-mono text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
                {pipeline.id}
              </p>
            </div>

            {/* Webhook URL with copy button */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Webhook URL</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-indigo-400 bg-gray-800 px-3 py-2 rounded-lg flex-1 truncate">
                  {webhookUrl}
                </p>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-colors whitespace-nowrap"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* List of subscriber URLs */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Subscribers</p>
              <div className="space-y-1">
                {pipeline.subscribers.map(sub => (
                  <p
                    key={sub.id}
                    className="font-mono text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg truncate"
                  >
                    {sub.targetUrl}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-300">
                {new Date(pipeline.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Test Webhook form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">🧪 Test Webhook</h2>

          <div>
            <p className="text-xs text-gray-400 mb-2">JSON Payload</p>
            <textarea
              aria-label="JSON Payload"
              value={payload}
              onChange={e => {
                setPayload(e.target.value)
                setPayloadError('')
              }}
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-green-400 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
            {payloadError && (
              <p className="text-red-400 text-xs mt-1">⚠️ {payloadError}</p>
            )}
          </div>

          {/* Disabled when pipeline is inactive to prevent creating stuck jobs */}
          <button
            onClick={handleSendWebhook}
            disabled={sending || !pipeline.isActive}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {sending ? '⏳ Sending...' : '🚀 Send Webhook'}
          </button>

          {!pipeline.isActive && (
            <p className="text-yellow-400 text-xs text-center">
              ⚠️ Pipeline is inactive — activate it first
            </p>
          )}

          {/* Show the job ID after a successful send so the user can navigate to it */}
          {sendResult && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-medium mb-2">✅ Webhook Accepted</p>
              <p className="text-xs text-gray-400">Job ID:</p>
              <Link
                to={`/jobs/${sendResult.jobId}`}
                className="font-mono text-xs text-indigo-400 hover:text-indigo-300"
              >
                {sendResult.jobId}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent jobs for this pipeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
          <Link to="/jobs" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No jobs yet — send a test webhook above
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Job ID</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Created</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr
                  key={job.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs text-gray-300">
                    {job.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Show pipeline config if present */}
      {pipeline.config && (
        <JsonViewer data={pipeline.config} title="Pipeline Config" />
      )}

    </div>
  )
}