import { useAuth } from '@renderer/hooks/useAuth'
import { NavLink } from 'react-router'

export function SideNav(): React.JSX.Element {
  const { logout } = useAuth()

  return (
    <header className="h-full px-8 py-6 w-fit min-w-50 flex flex-col justify-between bg-slate-900">
      <section>
        <h2 className="font-bold text-2xl">TicketPremium</h2>
      </section>
      <nav className="flex flex-col gap-y-2">
        <li>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            to={'/soccer-games'}
          >
            Partidos
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            to={'/locations'}
          >
            Localidades
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            to={'/purchase'}
          >
            Comprar
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            to={'/reports'}
          >
            Reportes
          </NavLink>
        </li>
        <li>
          <button type="button" className={'nav-link nav-link--danger'} onClick={logout}>
            Cerrar sesión
          </button>
        </li>
      </nav>
    </header>
  )
}
