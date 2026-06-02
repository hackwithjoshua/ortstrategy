import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import RegBanner from './components/RegBanner'
import CookieBanner from './components/CookieBanner'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Stats from './components/Stats'
import ProjectsCarousel from './components/ProjectsCarousel'
import Testimonials from './components/Testimonials'
import TrustedBy from './components/TrustedBy'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import HireEngineers from './pages/HireEngineers'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import WorkPolicy from './pages/WorkPolicy'

function Home() {
  return (
    <>
      <ParticleBackground />
      <RegBanner />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Stats />
        <ProjectsCarousel />
        <Testimonials />
        <TrustedBy />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CookieBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hire-engineers" element={<HireEngineers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/work-policy" element={<WorkPolicy />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
