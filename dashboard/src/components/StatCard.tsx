interface StatCardProps {
  label: string
  value: number | string
  accent?: 'default' | 'green' | 'red' | 'yellow' | 'blue'
}

const accentStyles: Record<string, string> = {
  default: 'text-white',
  green:   'text-emerald-400',
  red:     'text-red-400',
  yellow:  'text-amber-400',
  blue:    'text-blue-400',
}

export default function StatCard({ label, value, accent = 'default' }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${accentStyles[accent]}`}>{value}</p>
    </div>
  )
}