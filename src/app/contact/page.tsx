import { PageShell } from '@/components/marketing/PageShell'

export default function ContactPage() {
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
      <h1 className="text-3xl font-bold text-foreground mb-4">Contact</h1>
      <p className="text-muted-foreground leading-relaxed">
        Need help? Reach us at <a href="mailto:support@mernmaxxingg.com" className="text-[var(--primary)] hover:underline">support@mernmaxxingg.com</a>.
      </p>
    </PageShell>
  )
}
