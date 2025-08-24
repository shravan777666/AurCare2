import { Link } from 'react-router-dom'

export default function Staff() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
        <p className="mt-2 max-w-2xl text-gray-600">Assign services, track performance, and optimize schedules effortlessly.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Highlights</h2>
          <ul className="list-inside list-disc text-gray-700">
            <li>Role-based permissions</li>
            <li>Availability & shift planner</li>
            <li>Service specialization</li>
            <li>Performance insights</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1400&auto=format&fit=crop" alt="Salon team" />
        </div>
      </section>

      <div className="mt-10">
        <Link to="/register" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Invite Team</Link>
      </div>
    </main>
  )
}