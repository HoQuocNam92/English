'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function GoogleCallbackInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const userRaw = searchParams.get('user')

    if (accessToken && userRaw) {
      try {
        const user = JSON.parse(userRaw)
        const role = (user.roles?.[0] ?? 'learner')
        const session = {
          accessToken,
          refreshToken: refreshToken ?? null,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? user.email?.split('@')[0] ?? '',
            role,
            roles: user.roles ?? [role],
            permissions: user.permissions ?? [],
          },
        }
        localStorage.setItem('techenglish.web.session', JSON.stringify(session))

        const roles = user.roles ?? []
        if (roles.includes('admin')) router.replace('/admin/dashboard')
        else if (roles.includes('teacher')) router.replace('/admin/dashboard')
        else router.replace('/learn')
      } catch {
        router.replace('/login?error=oauth_failed')
      }
    } else {
      router.replace('/login?error=oauth_failed')
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  )
}
