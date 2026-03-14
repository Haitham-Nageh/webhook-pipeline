import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../lib/api'
import type { Job, JobStatus } from '../types'
import StatusBadge from '../components/StatusBadge'

const STATUS_FILTERS: { label: string; value: JobStatus | 'ALL' }[] = [
  { label: 'All',        value: 'ALL' },
  { label: 'Pending',    value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed',  value: 'COMPLETED' },
  { label: 'Failed',     value: 'FAILED' },
]

export default function JobsPage() {
  const [jobs, setJobs]         = useState<Job[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [status, setStatus]     = useState<JobStatus | 'ALL'>('ALL')
  const [page, setPage]         = useState(1)
  const limit = 10

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = { page, limit }
      if (status !== 'ALL') params.status = status

      const data = await getJobs(params)
      setJobs(data.jobs)
      setTotal(data.pagination.total)
    } catch {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [status, page])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleStatusChange = (s: JobStatus | 'ALL') => {
    setStatus(s)
    setPage(1)
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
        ❌ {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Jobs</h1>
        <p className="text-gray-400 mt-1">{total} total job{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No jobs found</p>
            <p className="text-gray-600 text-sm mt-2">
              {status !== 'ALL' ? 'Try a different filter' : 'Send a webhook to create jobs'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Job ID</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Pipeline</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Created</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Completed</th>
                <th className="text-right px-6 py-3 text-xs text-gray-400 font-medium"></th>
                <td className="px-6 py-3 text-right"></td>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr
                  key={job.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-3">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="font-mono text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {job.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {job.pipeline?.name ?? '—'}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {job.completedAt
                      ? new Date(job.completedAt).toLocaleString()
                      : '—'}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg text-sm transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}