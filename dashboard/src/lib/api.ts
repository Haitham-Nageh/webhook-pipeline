import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Pipelines ────────────────────────────────────────────
export const getPipelines = () =>
  api.get('/pipelines').then(r => r.data.data)

export const getPipeline = (id: string) =>
  api.get(`/pipelines/${id}`).then(r => r.data.data)

export const createPipeline = (data: object) =>
  api.post('/pipelines', data).then(r => r.data.data)

export const updatePipeline = (id: string, data: object) =>
  api.patch(`/pipelines/${id}`, data).then(r => r.data.data)

export const deletePipeline = (id: string) =>
  api.delete(`/pipelines/${id}`).then(r => r.data.data)

export const sendWebhook = (sourceKey: string, payload: object) =>
  api.post(`/webhooks/${sourceKey}`, payload).then(r => r.data.data)

// ─── Jobs ─────────────────────────────────────────────────
export const getJobs = (params?: object) =>
  api.get('/jobs', { params }).then(r => r.data.data)

export const getJob = (id: string) =>
  api.get(`/jobs/${id}`).then(r => r.data.data)

export const getJobDeliveries = (id: string) =>
  api.get(`/jobs/${id}/deliveries`).then(r => r.data.data)