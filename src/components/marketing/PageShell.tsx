import Link from 'next/link'
import { Logo } from './Logo'
import { Footer } from './Footer'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

interface NavLink {
  label: string
  href: string
}

interface PageShellProps {
  children: ReactNode
  navLinks?: NavLink[]
  showCta?: boolean
  ctaHref?: string
  ctaLabel?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-full',
}

export function PageShell({
  children,
  navLinks = [],
  showCta = false,
  ctaHref = '/register',
  ctaLabel = 'Get Started Free',
  maxWidth = 'xl',
}: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          {navLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          {showCta && (
            <Link href={ctaHref}>
              <Button size="sm" className="gap-2">
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className={`mx-auto px-6 py-16 ${maxWidthClasses[maxWidth]}`}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
