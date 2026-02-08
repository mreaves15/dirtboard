import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">DirtBoard</h1>
          <nav className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/properties" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Properties
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Land Lead Management</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Track properties from discovery to closing. Filter, sort, and manage your entire pipeline in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/properties" 
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              View Properties
            </Link>
            <Link 
              href="/properties/new" 
              className="border border-input bg-background px-6 py-3 rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Add Property
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
