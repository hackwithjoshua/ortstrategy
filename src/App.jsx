import './index.css'
import { lazy, Suspense } from 'react'
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

const HireEngineers = lazy(() => import('./pages/HireEngineers'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const WorkPolicy = lazy(() => import('./pages/WorkPolicy'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Admin = lazy(() => import('./pages/Admin'))

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
          <Suspense fallback={null}>
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
