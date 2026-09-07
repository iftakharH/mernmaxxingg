import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'
import { Logo } from '@/components/marketing/Logo'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Card className="border-border shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Forgot password?</CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you a reset link.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send reset link
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
