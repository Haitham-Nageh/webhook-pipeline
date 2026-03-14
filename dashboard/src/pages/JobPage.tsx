import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJob, getJobDeliveries } from '../lib/api'
import type { Job, DeliveryAttempt } from '../types'
import StatusBadge from '../components/StatusBadge'
import JsonViewer from '../components/JsonViewer'

export default function JobPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob]               = useState<Job | null>(null)
  const [deliveries, setDeliveries] = useState<DeliveryAttempt[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const load = async () => {
    setError('')
    try {
      const [j, d] = await Promise.all([
        getJob(id!),
        getJobDeliveries(id!),
      ])
      setJob(j)
      setDeliveries(d)
    } catch {
      setError('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) {
      setError('Missing job ID')
      setLoading(false)
      return
    }

    void load()
    const interval = setInterval(async () => {
      const j = await getJob(id).catch(() => null)
      if (!j) return
      setJob(j)
      if (j.status === 'COMPLETED' || j.status === 'FAILED') {
        clearInterval(interval)
        const d = await getJobDeliveries(id).catch(() => [])
        setDeliveries(d)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
        ❌ {error || 'Job not found'}
      </div>
    )
  }

  const isLive = job.status === 'PENDING' || job.status === 'PROCESSING'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Job Details</h1>
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-gray-400 mt-0.5">{job.id}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Job Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Job Info</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Pipeline</p>
            <Link
              to={`/pipelines/${job.pipelineId}`}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              {job.pipeline?.name ?? job.pipelineId.slice(0, 8) + '...'}
            </Link>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Processing Type</p>
            <p className="text-sm text-gray-300">{job.pipeline?.processingType ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Created</p>
            <p className="text-sm text-gray-300">
              {new Date(job.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Completed</p>
            <p className="text-sm text-gray-300">
              {job.completedAt ? new Date(job.completedAt).toLocaleString() : '—'}
            </p>
          </div>
        </div>

        {job.errorMessage && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-red-400 font-medium mb-1">Error</p>
            <p className="text-sm text-red-300">{job.errorMessage}</p>
          </div>
        )}
      </div>

      {/* Payloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JsonViewer data={job.payload} title="Original Payload" />
        {job.processedPayload ? (
          <JsonViewer data={job.processedPayload} title="Processed Payload" />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-center">
            <p className="text-gray-500 text-sm">
              {isLive ? '⏳ Worker processing payload...' : 'No processed payload'}
            </p>
          </div>
        )}
      </div>

      {/* Delivery Attempts */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">
            Delivery Attempts
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({deliveries.length})
            </span>
          </h2>
        </div>

        {deliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isLive ? '⏳ Waiting for delivery...' : 'No delivery attempts yet'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">#</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Subscriber</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Response</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Attempted At</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr
                  key={d.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {d.attemptNumber}
                  </td>
                  <td
                    title={d.subscriber.targetUrl}
                    className="px-6 py-3 font-mono text-xs text-gray-300 max-w-[260px] truncate"
                  >
                    {d.subscriber.targetUrl}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      d.status === 'SUCCESS'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {d.responseStatus ? (
                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                        d.responseStatus >= 200 && d.responseStatus < 300
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        HTTP {d.responseStatus}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(d.attemptedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-xs text-red-400 max-w-[150px] truncate">
                    {d.errorMessage ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
