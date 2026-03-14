interface StatCardProps {
  label: string
  value: number | string
  color?: string
  icon?: string
}

export default function StatCard({ label, value, color = 'text-white', icon }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm">{label}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}