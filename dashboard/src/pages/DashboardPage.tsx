import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs, getPipelines } from '../lib/api'
import type { Job, Pipeline } from '../types'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

export default function DashboardPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
useEffect(() => {
  const load = async () => {
    try {
      const [p, j] = await Promise.all([
        getPipelines(),
        getJobs({ limit: 10 }),
      ])
      setPipelines(p)
      setJobs(j.jobs)
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  void load()
}, [])

  const stats = {
    total:      pipelines.length,
    active:     pipelines.filter(p => p.isActive).length,
    completed:  jobs.filter(j => j.status === 'COMPLETED').length,
    failed:     jobs.filter(j => j.status === 'FAILED').length,
    pending:    jobs.filter(j => j.status === 'PENDING').length,
    processing: jobs.filter(j => j.status === 'PROCESSING').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }
if (error) {
  return (
    <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
      ❌ {error}
    </div>
  )
}
  return (
    
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your webhook pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Pipelines"  value={stats.total}      icon="⚡" />
        <StatCard label="Active Pipelines" value={stats.active}     icon="✅" color="text-green-400" />
        <StatCard label="Completed Jobs"   value={stats.completed}  icon="📦" color="text-green-400" />
        <StatCard label="Failed Jobs"      value={stats.failed}     icon="❌" color="text-red-400" />
        <StatCard label="Pending Jobs"     value={stats.pending}    icon="⏳" color="text-yellow-400" />
        <StatCard label="Processing Jobs"  value={stats.processing} icon="⚙️" color="text-blue-400" />
      </div>

      {/* Recent Jobs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
          <Link to="/jobs" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No jobs yet — send a webhook to get started
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Job ID</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Pipeline</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <Link to={`/jobs/${job.id}`} className="text-indigo-400 hover:text-indigo-300 font-mono text-xs">
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}