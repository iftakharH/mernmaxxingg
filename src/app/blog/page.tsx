import { PageShell } from '@/components/marketing/PageShell'

export default function BlogPage() {
  return (
    <PageShell
      navLinks={[
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ]}
      showCta
    >
      <h1 className="text-3xl font-bold text-foreground mb-4">Blog</h1>
      <p className="text-muted-foreground leading-relaxed">
        Blog posts are coming soon. Meanwhile, continue your learning journey from the dashboard.
      </p>
    </PageShell>
  )
}
