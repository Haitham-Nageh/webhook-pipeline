interface JsonViewerProps {
  data: unknown
  title?: string
}

export default function JsonViewer({ data, title }: JsonViewerProps) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-gray-800">
          <p className="text-xs text-gray-400 font-medium">{title}</p>
        </div>
      )}
      <pre className="p-4 text-xs text-green-400 overflow-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}