import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import PipelinesPage from './pages/PipelinesPage'
import PipelinePage from './pages/PipelinePage'
import JobsPage from './pages/JobsPage'
import JobPage from './pages/JobPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pipelines" element={<PipelinesPage />} />
        <Route path="/pipelines/:id" element={<PipelinePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobPage />} />
      </Routes>
    </Layout>
  )
}