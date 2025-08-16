import { Link } from 'react-router-dom'

function Landing() {
  return (
    <main>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%),radial-gradient(circle_at_0%_50%,white,transparent_25%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Welcome to AuraCare</h1>
          <p className="text-white/90 text-lg sm:text-xl mb-8">
            Manage salon registrations and access your dashboard with ease.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100 transition"
            >
              Register as Salon Owner
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-white/80 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
        {[{
          title: 'Fast Onboarding',
          desc: 'Simple forms and quick approval pipeline for salon owners.'
        }, {
          title: 'Secure Access',
          desc: 'Token-based authentication and role-aware permissions.'
        }, {
          title: 'Modern UI',
          desc: 'Clean, responsive design powered by Tailwind CSS.'
        }].map((card, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

export default Landing