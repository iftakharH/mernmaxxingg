import { PageShell } from '@/components/marketing/PageShell'

export default function CareersPage() {
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
      <h1 className="text-3xl font-bold text-foreground mb-4">Careers</h1>
      <p className="text-muted-foreground leading-relaxed">
        We are not hiring publicly yet. Check back soon for education and platform roles.
      </p>
    </PageShell>
  )
}
