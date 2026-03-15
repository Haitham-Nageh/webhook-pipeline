import axios from 'axios'

// Shared axios instance for all API calls.
// The base URL is read from the .env file (VITE_API_URL)
// so it can be changed per environment without touching the code.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Pipelines ────────────────────────────────────────────

// Returns all pipelines with their subscribers
export const getPipelines = () =>
  api.get('/pipelines').then(r => r.data.data)

// Returns a single pipeline with its subscribers
export const getPipeline = (id: string) =>
  api.get(`/pipelines/${id}`).then(r => r.data.data)

// Creates a pipeline with name, processingType, and subscriber URLs
export const createPipeline = (data: object) =>
  api.post('/pipelines', data).then(r => r.data.data)

// Partial update — only provided fields are changed
export const updatePipeline = (id: string, data: object) =>
  api.patch(`/pipelines/${id}`, data).then(r => r.data.data)

// Deletes a pipeline and cascades to its subscribers and jobs
export const deletePipeline = (id: string) =>
  api.delete(`/pipelines/${id}`).then(r => r.data.data)

// Sends a test webhook to a pipeline's source URL
// Returns the created jobId so the UI can navigate to the job details page
export const sendWebhook = (sourceKey: string, payload: object) =>
  api.post(`/webhooks/${sourceKey}`, payload).then(r => r.data.data)

// ─── Jobs ─────────────────────────────────────────────────

// Returns a paginated list of jobs with optional status filter
// params: { status?, page?, limit? }
export const getJobs = (params?: object) =>
  api.get('/jobs', { params }).then(r => r.data.data)

// Returns a single job with pipeline info and delivery attempts
export const getJob = (id: string) =>
  api.get(`/jobs/${id}`).then(r => r.data.data)

// Returns delivery attempts for a job independently of the full job payload
export const getJobDeliveries = (id: string) =>
  api.get(`/jobs/${id}/deliveries`).then(r => r.data.data)