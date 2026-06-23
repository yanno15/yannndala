import { lazy, Suspense } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'

// ✅ FIX TBT : Lazy load toutes les sections sous le fold
const About      = lazy(() => import('../components/sections/About'))
const Services   = lazy(() => import('../components/sections/Services'))
const Projects   = lazy(() => import('../components/sections/Projects'))
const Skills     = lazy(() => import('../components/sections/Skills'))
const Experience = lazy(() => import('../components/sections/Experience'))
const Contact    = lazy(() => import('../components/sections/Contact'))

// Skeleton minimaliste pendant le chargement
const SectionSkeleton = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
  </div>
)

export default function Home() {
  return (
    <div className="relative min-h-screen bg-void text-light">
      <Navbar />
      <main>
        {/* Hero chargé immédiatement = meilleur LCP */}
        <Hero />

        {/* Tout le reste en lazy = meilleur TBT/FCP */}
        <Suspense fallback={<SectionSkeleton />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Skills />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Experience />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
