import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_layout/')({
  component: Index,
})

function Index() {

  return (
    <div className="h-full">
      Дашборд
    </div>  
  )
}
