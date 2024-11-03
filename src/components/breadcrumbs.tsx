import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { useMemo } from "react"

export default function Breadcrumbs() {
  const matches = useRouterState({ select: (s) => s.matches })
  const breadcrumbs = useMemo(() => {
    return matches
      .filter((match) => match.context.header && match.context.header !== 'Главная')
      .map(({ pathname, context }) => {
        return {
          title: context.header,
          path: pathname,
        }
      })
  }, [matches])

  return (
    <nav className="flex items-end fixed bottom-0 border-t overflow-hidden inset-x-0 bg-background py-1 px-4 pr-8 w-screen h-10">
      <ul className="flex items-center justify-end w-full gap-2">
        {breadcrumbs.length > 0 ? (
          breadcrumbs.map((breadcrumb, idx) => (
            <li key={idx}>
              <Link to={breadcrumb.path}>{breadcrumb.title}</Link>
              {idx !== breadcrumbs.length - 1 && <ChevronRight className="size-4" />}
            </li>
          ))
        ) : (
          <li>
            <Link to="/">Главная</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
