'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Brain, 
  PenTool, 
  Search, 
  Star, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">OmniNote AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
            >
              Go to App <LayoutDashboard size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Your AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
                Knowledge Engine
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Generate structured notes, professional blog posts, and detailed product reviews in seconds. The ultimate tool for creators and learners.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black text-white font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Start Creating Now <ArrowRight size={20} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-black/10 bg-white font-semibold text-lg hover:bg-slate-50 transition-colors">
                View Examples
              </button>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Brain className="text-indigo-600" />}
                title="Smart Notes"
                description="Instantly transform any topic into structured, easy-to-digest study notes or meeting summaries."
              />
              <FeatureCard 
                icon={<PenTool className="text-emerald-600" />}
                title="Blog Generation"
                description="Create SEO-optimized blog content with professional formatting and engaging narratives."
              />
              <FeatureCard 
                icon={<Star className="text-amber-500" />}
                title="Product Reviews"
                description="Get balanced, detailed reviews of any product, highlighting pros, cons, and value."
              />
            </div>
          </div>
        </section>

        {/* Search Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[32px] p-8 md:p-16 text-white overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">AI-Powered Search</h2>
              <p className="text-slate-400 text-lg mb-8">
                Don&apos;t just search for links. Search for answers. Our AI synthesizes information from across the web to give you a complete picture.
              </p>
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="text-slate-500" size={20} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..." 
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            {/* Abstract background element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-3xl -mr-20 -mt-20 pointer-events-none" />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-black w-6 h-6" />
            <span className="font-display font-bold text-lg">OmniNote AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-black transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-slate-400">© 2024 OmniNote AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl border border-black/5 bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
