import type { JobStatus } from '../types'

const styles: Record<JobStatus, string> = {
  PENDING:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  COMPLETED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  FAILED:     'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}