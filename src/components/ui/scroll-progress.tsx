import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string
  height?: number
  position?: 'top' | 'bottom'
}

const ScrollProgress = ({ 
  className,
  color = 'var(--primary)',
  height = 2,
  position = 'bottom',
  ...props 
}: ScrollProgressProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (scrollTop / scrollHeight) * 100
      setProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className={cn(
        'fixed left-0 right-0 z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
      {...props}
    >
      <div 
        style={{ 
          width: `${progress}%`,
          height: `${height}px`,
          backgroundColor: color,
          transition: 'width 100ms ease-out'
        }}
      />
    </div>
  )
}

export default ScrollProgress 