import { PageShell } from '@/components/marketing/PageShell'

export default function AboutPage() {
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
      <h1 className="text-3xl font-bold text-foreground mb-4">About MERNMaxxingg</h1>
      <p className="text-muted-foreground leading-relaxed">
        MERNMaxxingg helps learners become job-ready full-stack developers with guided assignments,
        project-based practice, and AI-personalized curriculum planning.
      </p>
    </PageShell>
  )
}
