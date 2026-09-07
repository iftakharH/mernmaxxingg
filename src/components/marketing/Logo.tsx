import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const sizes = {
  sm: { wrapper: 'h-8 w-8', text: 'text-base' },
  md: { wrapper: 'h-9 w-9', text: 'text-xl' },
  lg: { wrapper: 'h-10 w-10', text: 'text-2xl' },
}

export function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const { wrapper, text } = sizes[size]
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-bold text-foreground ${text} ${className}`}
    >
      <span
        className={`relative flex ${wrapper} items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]`}
        aria-hidden="true"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </span>
      MERNMaxxingg
    </Link>
  )
}
