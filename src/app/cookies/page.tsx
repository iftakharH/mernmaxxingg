import { PageShell } from '@/components/marketing/PageShell'

export default function CookiesPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-foreground mb-4">Cookie Policy</h1>
      <p className="text-muted-foreground leading-relaxed">
        We use authentication and session cookies required for login and protected dashboard access.
      </p>
    </PageShell>
  )
}
