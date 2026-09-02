import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import MapPage from './pages/MapPage.jsx'
import WizardPage from './pages/WizardPage.jsx'
import LoadingPage from './pages/LoadingPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import PropertiesPage from './pages/PropertiesPage.jsx'
import AuthPages from './pages/AuthPages.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/wizard" element={<WizardPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/results/:id" element={<ResultsPage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/login" element={<AuthPages />} />
    </Routes>
  )
}

export default App
