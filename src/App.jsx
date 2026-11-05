import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/navbar.jsx'
import Footer from './components/Footer.jsx'
import ECIChatbot from './components/ECIChatbot.jsx'
import Home from './pages/Home.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import PartiesPage from './pages/PartiesPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import MethodologyPage from './pages/MethodologyPage.jsx'

import { validatePromises } from './Data/validatePromises.js'
import { validateManifestos } from './Data/validateManifestos.js'

console.log("Promise validation:", validatePromises())

function App() {
  console.log("Manifesto validation:", validateManifestos())

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/parties" element={<PartiesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
      </Routes>

      <Footer />
            <ECIChatbot />
    </BrowserRouter>
  )
}

export default App