import { createClient } from '@/utils/supabase/server';
import { Check, X } from 'lucide-react';
export default async function Page() {
  const supabase = await createClient()

  try {
    // Test basic connection
    const { data: products, error } = await supabase.from('products').select('*')

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Get user profile if logged in
    let profile = null
    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = profileData
    }

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p className="flex items-center gap-2">
              Supabase URL:
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <><Check className="h-4 w-4 text-green-600" /> Set</>
              ) : (
                <><X className="h-4 w-4 text-red-600" /> Missing</>
              )}
            </p>
            <p className="flex items-center gap-2">
              Supabase Key:
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <><Check className="h-4 w-4 text-green-600" /> Set</>
              ) : (
                <><X className="h-4 w-4 text-red-600" /> Missing</>
              )}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Current User:</h2>
          <div className="bg-gray-100 p-4 rounded">
            {userError ? (
              <p className="text-red-600">User Error: {userError.message}</p>
            ) : user ? (
              <div>
                <p>Email: {user.email}</p>
                <p>ID: {user.id}</p>
                <p>Role: {profile?.role || 'No profile found'}</p>
              </div>
            ) : (
              <p>Not logged in</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Products Query:</h2>
          <div className="bg-gray-100 p-4 rounded">
            {error ? (
              <p className="text-red-600">Error: {error.message}</p>
            ) : (
              <div>
                <p>Products found: {products?.length || 0}</p>
                {products && products.length > 0 ? (
                  <div className="mt-2">
                    <h3 className="font-medium">Sample products:</h3>
                    <ul className="list-disc list-inside">
                      {products.slice(0, 3).map((product: any) => (
                        <li key={product.id}>{product.name} - LKR {product.price}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-orange-600">No products found in database</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Raw Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ products, error: error?.message, user: user?.email, profile }, null, 2)}
          </pre>
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Connection Error</h1>
        <pre className="bg-red-100 p-4 rounded">
          {err instanceof Error ? err.message : 'Unknown error'}
        </pre>
      </div>
    )
  }
}