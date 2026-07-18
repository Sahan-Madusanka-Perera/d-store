import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don&apos;t have permission to access this page. Only administrators can access the admin panel.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Homepage
            </Link>
            
            <Link
              href="/login"
              className="block w-full border border-border text-foreground py-2 px-4 rounded-md hover:bg-muted transition-colors"
            >
              Sign in with Different Account
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Need admin access? Contact the system administrator.</p>
            <p className="mt-2">Email: admin@dstore.lk</p>
          </div>
        </div>
      </div>
    </div>
  )
}