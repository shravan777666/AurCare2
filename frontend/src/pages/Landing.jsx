import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

// Simple auto slider with fade/slide transitions
function HeroSlider() {
  const slides = useMemo(() => [
    {
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop',
      alt: 'Modern salon environment with stylist chairs'
    },
    {
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop',
      alt: 'Beauty products on a shelf'
    },
    {
      url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1920&auto=format&fit=crop',
      alt: 'Stylist working with client'
    }
  ], [])

  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <section className="relative h-[70vh] w-full overflow-hidden rounded-2xl bg-black/10">
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-out will-change-transform ${i === index ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-[1.02] translate-x-2'}`}
            style={{
              backgroundImage: `url(${s.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            aria-label={s.alt}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

      {/* Content overlay */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Elevate Your Salon Experience
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-200 sm:text-lg md:text-xl">
          Smart bookings, seamless staff management, and delighted customers — all in one modern platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20"
          >
            Explore Features
          </Link>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'bg-white/60 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/50 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
        <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600">Learn more
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </span>
      </div>
    </Link>
  )
}

function Landing() {
  return (
    <main className="bg-gray-50">
      {/* Hero with slider */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <HeroSlider />
      </div>

      {/* Features */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Powerful features to run your salon</h2>
          <p className="mt-2 text-gray-600">Everything you need to manage bookings, staff, and growth.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            to="/features/bookings"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 2a1 1 0 00-1 1v3h2V4h10v2h2V3a1 1 0 00-1-1H6z" /><path d="M3 7a1 1 0 011-1h16a1 1 0 011 1v12a3 3 0 01-3 3H6a3 3 0 01-3-3V7zm4 3a1 1 0 100 2h5a1 1 0 100-2H7z" /></svg>}
            title="Smart Bookings"
            desc="Real-time scheduling with reminders to reduce no-shows and keep chairs filled."
          />
          <FeatureCard
            to="/features/staff"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zM8 11h8v2H8v-2z" /></svg>}
            title="Staff Management"
            desc="Assign services, track performance, and optimize schedules with ease."
          />
          <FeatureCard
            to="/features/customer"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 2l3.5 7H23l-5.5 4.5L19.5 21 12 17.5 4.5 21l2-7.5L1 9h7.5L12 2z" /></svg>}
            title="Delight Customers"
            desc="Beautiful booking flow, quick check-ins, and loyalty-ready experiences."
          />
          <FeatureCard
            to="/features/insights"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3 3h18v2H3z" /><path d="M7 7h10v10H7z" /><path d="M3 19h18v2H3z" /></svg>}
            title="Insights & Reports"
            desc="Monitor revenue, utilization, and growth trends with friendly dashboards."
          />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Built for modern salons</h3>
            <p className="mt-3 text-gray-600">
              AuraCare brings an elegant, efficient workflow to your business. From first click to returning customer,
              we help you create memorable experiences and predictable growth.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/register" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Create Account</Link>
              <Link to="/login" className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Sign In</Link>
            </div>
          </div>
          <div className="order-1 overflow-hidden rounded-2xl md:order-2">
            <img
              src="https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?q=80&w=1400&auto=format&fit=crop"
              alt="Salon interior"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-16" />
    </main>
  )
}

export default Landing