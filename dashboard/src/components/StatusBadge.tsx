import type { JobStatus } from '../types'
const styles: Record<JobStatus, string> = {
  PENDING:    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  PROCESSING: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  COMPLETED:  'bg-green-500/20 text-green-400 border border-green-500/30',
  FAILED:     'bg-red-500/20 text-red-400 border border-red-500/30',
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}