import { PageShell } from '@/components/marketing/PageShell'

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground leading-relaxed">
        We store account and learning progress data to operate your personalized learning experience.
        Do not upload sensitive credentials or secrets into project submissions.
      </p>
    </PageShell>
  )
}
