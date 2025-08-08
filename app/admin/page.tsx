export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard - Simple Test</h1>
      <p className="text-gray-600">This is a simple test page to isolate the Netlify routing issue.</p>
      <p className="text-sm text-gray-500 mt-2">Timestamp: {new Date().toISOString()}</p>
      
      <div className="mt-8 space-y-4">
        <p>✅ If you see this page, the routing works fine</p>
        <p>❌ If you see redirect loops, it's a Netlify/deployment issue</p>
      </div>
    </div>
  )
}