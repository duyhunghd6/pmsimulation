const routes = [
  {
    href: '/login',
    label: 'Login boundary',
    description: 'Public entry point for Supabase Auth magic-link sign-in.',
  },
  {
    href: '/dashboard',
    label: 'Student route group',
    description: 'No-gameplay student shell; future data must arrive through authorized server queries.',
  },
  {
    href: '/instructor/dashboard',
    label: 'Instructor route group',
    description: 'No-gameplay instructor shell; future God Mode data stays behind instructor authorization.',
  },
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="panel">
        <span className="eyebrow">Apex Alpha MVP</span>
        <h1>Portfolio simulation shell</h1>
        <p>
          This App Router shell introduces only public navigation and role-specific route groups. It does not fetch,
          render, or expose gameplay data.
        </p>
        <div className="nav-grid" aria-label="Available app routes">
          {routes.map((route) => (
            <a className="card" href={route.href} key={route.href}>
              <strong>{route.label}</strong>
              <span>{route.description}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
