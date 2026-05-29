import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Stats from './components/Stats'
import ProjectsCarousel from './components/ProjectsCarousel'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'

function App() {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Stats />
        <ProjectsCarousel />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
