function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Frontend Skeleton
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">MyWorkItem</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            This app is scaffolded with React, TypeScript, Vite, Tailwind CSS,
            native fetch, and TanStack Query. Business pages and API flows are
            intentionally not implemented yet.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-medium">Current Scope</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>React + TypeScript + Vite</li>
              <li>Tailwind CSS</li>
              <li>fetch + TanStack Query</li>
              <li>Single SPA for user flow and admin flow</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-medium">Prepared Directories</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>app/router, app/providers, app/layouts</li>
              <li>api/client, api/queryKeys, api/mappers</li>
              <li>features/work-items, admin-work-items, auth-mock</li>
              <li>pages, components, styles, types</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
