import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import CodeReviewPage from './pages/CodeReviewPage'
import IDEPage from './pages/IDEPage'
import './App.css'

function Navigation() {
  const location = useLocation()

  // Don't show nav on IDE page (it has its own header)
  if (location.pathname === '/ide') return null

  return (
    <nav className="main-nav">
      <div className="nav-brand">🚀 AI Code Tools</div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Code Review
        </Link>
        <Link to="/ide" className={location.pathname === '/ide' ? 'active' : ''}>
          AI IDE ✨
        </Link>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* Original Code Review Page (preserved) */}
        <Route path="/" element={<CodeReviewPage />} />

        {/* New AI IDE Page (extension) */}
        <Route path="/ide" element={<IDEPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
