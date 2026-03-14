import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getPipelines,
  createPipeline,
  updatePipeline,
  deletePipeline,
} from '../lib/api'
import type { Pipeline, ProcessingType } from '../types'

const PROCESSING_TYPES: ProcessingType[] = [
  'metadata_enrichment',
  'sensitive_field_redaction',
  'event_annotation',
]

const PROCESSING_LABELS: Record<ProcessingType, string> = {
  metadata_enrichment:      '📦 Metadata Enrichment',
  sensitive_field_redaction: '🔒 Sensitive Field Redaction',
  event_annotation:         '🏷️ Event Annotation',
}

interface PipelineForm {
  name: string
  processingType: ProcessingType
  subscribers: string
}

const defaultForm: PipelineForm = {
  name: '',
  processingType: 'metadata_enrichment',
  subscribers: '',
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState<PipelineForm>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const load = async () => {
    try {
      const data = await getPipelines()
      setPipelines(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

const showToast = (msg: string, isError = false) => {
  if (isError) {
    setError(msg)
    setTimeout(() => setError(''), 3000)
  } else {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }
}
  const handleCreate = async () => {
    if (!form.name.trim()) return showToast('Name is required', true)
    const subs = form.subscribers.split('\n').map(s => s.trim()).filter(Boolean)
    if (subs.length === 0) return showToast('At least one subscriber URL is required', true)

    setSubmitting(true)
    try {
      await createPipeline({
        name: form.name,
        processingType: form.processingType,
        subscribers: subs,
      })
      setForm(defaultForm)
      setShowForm(false)
      showToast('Pipeline created successfully!')
      await load()
    } catch {
      showToast('Failed to create pipeline', true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (pipeline: Pipeline) => {
    try {
      await updatePipeline(pipeline.id, { isActive: !pipeline.isActive })
      showToast(`Pipeline ${pipeline.isActive ? 'deactivated' : 'activated'}`)
      await load()
    } catch {
      showToast('Failed to update pipeline', true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pipeline?')) return
    try {
      await deletePipeline(id)
      showToast('Pipeline deleted')
      await load()
    } catch {
      showToast('Failed to delete pipeline', true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipelines</h1>
          <p className="text-gray-400 mt-1">{pipelines.length} pipeline{pipelines.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ New Pipeline'}
        </button>
      </div>

      {/* Toast */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Create Pipeline</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="My Pipeline"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Processing Type</label>
<select
  aria-label="Processing Type"
  value={form.processingType}
  onChange={e => setForm({ ...form, processingType: e.target.value as ProcessingType })}
  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
>
              {PROCESSING_TYPES.map(t => (
                <option key={t} value={t}>{PROCESSING_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Subscriber URLs
              <span className="text-gray-500 ml-1">(one per line)</span>
            </label>
            <textarea
              value={form.subscribers}
              onChange={e => setForm({ ...form, subscribers: e.target.value })}
              placeholder="https://webhook.site/your-url"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Pipeline'}
          </button>
        </div>
      )}

      {/* Pipelines List */}
      {pipelines.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">No pipelines yet</p>
          <p className="text-gray-600 text-sm mt-2">Create your first pipeline to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pipelines.map(pipeline => (
            <div
              key={pipeline.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${pipeline.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
                <div>
                  <Link
                    to={`/pipelines/${pipeline.id}`}
                    className="text-white font-medium hover:text-indigo-400 transition-colors"
                  >
                    {pipeline.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {PROCESSING_LABELS[pipeline.processingType]} •{' '}
                    {pipeline.subscribers.length} subscriber{pipeline.subscribers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pipeline.isActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {pipeline.isActive ? 'Active' : 'Inactive'}
                </span>

                <button
                  onClick={() => handleToggle(pipeline)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  {pipeline.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <Link
                  to={`/pipelines/${pipeline.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 transition-colors"
                >
                  View
                </Link>

                <button
                  onClick={() => handleDelete(pipeline.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}