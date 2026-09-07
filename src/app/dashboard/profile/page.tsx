import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
        <p className="text-muted-foreground mt-1">
          Review your account information and learner identity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Synced from your authentication provider.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium text-foreground">Name:</span> {session.user.name || 'Not set'}</p>
          <p><span className="font-medium text-foreground">Email:</span> {session.user.email || 'Not set'}</p>
          <p><span className="font-medium text-foreground">Role:</span> {session.user.role || 'USER'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
