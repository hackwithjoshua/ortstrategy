import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
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
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Admin from './pages/Admin'

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
      <AuthProvider>
        <BrowserRouter>
          <CookieBanner />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hire-engineers" element={<HireEngineers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/work-policy" element={<WorkPolicy />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
