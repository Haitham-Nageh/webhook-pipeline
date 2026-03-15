import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPipelines,
  createPipeline,
  updatePipeline,
  deletePipeline,
} from "../lib/api";
import type { Pipeline, ProcessingType } from "../types";

const PROCESSING_TYPES: ProcessingType[] = [
  "metadata_enrichment",
  "sensitive_field_redaction",
  "event_annotation",
];

const PROCESSING_LABELS: Record<ProcessingType, string> = {
  metadata_enrichment: "Metadata Enrichment",
  sensitive_field_redaction: "Sensitive Field Redaction",
  event_annotation: "Event Annotation",
};

interface PipelineForm {
  name: string;
  processingType: ProcessingType;
  subscribers: string;
}

const defaultForm: PipelineForm = {
  name: "",
  processingType: "metadata_enrichment",
  subscribers: "",
};

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PipelineForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const data = await getPipelines();
      setPipelines(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return showToast("Name is required", true);
    const subs = form.subscribers
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (subs.length === 0)
      return showToast("At least one subscriber URL is required", true);

    setSubmitting(true);
    try {
      await createPipeline({
        name: form.name,
        processingType: form.processingType,
        subscribers: subs,
      });
      setForm(defaultForm);
      setShowForm(false);
      showToast("Pipeline created successfully");
      await load();
    } catch {
      showToast("Failed to create pipeline", true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (pipeline: Pipeline) => {
    try {
      await updatePipeline(pipeline.id, { isActive: !pipeline.isActive });
      showToast(`Pipeline ${pipeline.isActive ? "deactivated" : "activated"}`);
      await load();
    } catch {
      showToast("Failed to update pipeline", true);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this pipeline? This will also remove all its jobs and subscribers.",
      )
    )
      return;
    try {
      await deletePipeline(id);
      showToast("Pipeline deleted");
      await load();
    } catch {
      showToast("Failed to delete pipeline", true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Pipelines</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pipelines.length} pipeline{pipelines.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          {showForm ? "Cancel" : "New Pipeline"}
        </button>
      </div>

      {/* Toast notifications */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-md text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Create pipeline form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create Pipeline</h2>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Order Events"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Processing Type
            </label>
            <select
              aria-label="Processing Type"
              value={form.processingType}
              onChange={(e) =>
                setForm({
                  ...form,
                  processingType: e.target.value as ProcessingType,
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500">
              {PROCESSING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROCESSING_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Subscriber URLs
              <span className="text-gray-600 ml-1">(one per line)</span>
            </label>
            <textarea
              aria-label="Subscriber URLs"
              value={form.subscribers}
              onChange={(e) =>
                setForm({ ...form, subscribers: e.target.value })
              }
              placeholder="https://your-endpoint.com/webhook"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            {submitting ? "Creating..." : "Create Pipeline"}
          </button>
        </div>
      )}

      {/* Pipeline list */}
      {pipelines.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">No pipelines yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Create a pipeline to start receiving webhooks
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {pipelines.map((pipeline, index) => (
            <div
              key={pipeline.id}
              className={`flex items-center justify-between px-6 py-4 hover:bg-gray-800/30 transition-colors ${
                index !== pipelines.length - 1 ? "border-b border-gray-800" : ""
              }`}>
              {/* Pipeline info */}
              <div className="flex items-center gap-3">
                {/* Active indicator dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    pipeline.isActive ? "bg-emerald-400" : "bg-gray-600"
                  }`}
                />
                <div>
                  <Link
                    to={`/pipelines/${pipeline.id}`}
                    className="text-sm text-white hover:text-gray-300 transition-colors font-medium">
                    {pipeline.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {PROCESSING_LABELS[pipeline.processingType]} &middot;{" "}
                    {pipeline.subscribers.length} subscriber
                    {pipeline.subscribers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${
                    pipeline.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-gray-800 text-gray-500 border-gray-700"
                  }`}>
                  {pipeline.isActive ? "Active" : "Inactive"}
                </span>

                <button
                  onClick={() => handleToggle(pipeline)}
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  {pipeline.isActive ? "Deactivate" : "Activate"}
                </button>

                <Link
                  to={`/pipelines/${pipeline.id}`}
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  View
                </Link>

                <button
                  onClick={() => handleDelete(pipeline.id)}
                  className="text-xs px-3 py-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
