import Link from 'next/link'

export default function Hero() {
  return (
    <section className="min-h-screen pt-24 flex items-center justify-center relative bg-secondary-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,166,81,0.1),transparent_50%)]" />
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Track Your Health <span className="text-primary">Journey</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Monitor your physical health through activity tracking, sleep analysis,
            calorie intake, and AI-powered fitness recommendations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto btn btn-primary text-center"
            >
              Get Started
            </Link>
            <Link 
              href="/demo" 
              className="w-full sm:w-auto btn btn-secondary text-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 