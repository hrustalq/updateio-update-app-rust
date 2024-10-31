import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"

export default function Breadcrumbs() {
  const { pathname } = useLocation()

  return (
    <nav className="flex items-end fixed bottom-0 inset-x-0 bg-background p-4">
      <ul className="flex items-center gap-2">
        {pathname.split('/').map((path, idx) => (
          <li key={idx}>
            <Link to={path}>{path}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
