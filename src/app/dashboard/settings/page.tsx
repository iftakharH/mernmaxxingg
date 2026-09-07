import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage notification and study preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning reminders</CardTitle>
          <CardDescription>These are local preference placeholders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="font-medium text-foreground">Daily study reminder</p>
              <p className="text-sm text-muted-foreground">Get a reminder to maintain your streak.</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" aria-label="Daily study reminder" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
