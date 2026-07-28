import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, HardHat, Mic, ArrowRight, Sparkles, Shield, Compass, Star } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden font-sans">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sticky Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="Jeebika Logo" />
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">Jeebika</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">Voice-First Platform</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-300">Fast Match</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="px-6 pt-16 pb-20 text-center relative max-w-4xl mx-auto z-10 flex-1 flex flex-col justify-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 mx-auto backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-Activated Matches with Live SMS Updates</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Find your next job with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">just your voice.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            The easiest way to connect workers and employers. No typing required. Speak your needs, match instantly with local opportunities, and manage everything with simple SMS controls.
          </motion.p>

          {/* Cards / Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto"
          >
            {/* Worker Card */}
            <motion.button
              whileHover={{ scale: 1.03, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/worker_registration')}
              className="group relative flex flex-col items-center justify-center p-8 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 overflow-hidden text-center h-64 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/10">
                <HardHat className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I am a Worker</h3>
              <p className="text-slate-400 text-sm mb-4">Register to find nearby jobs and daily wages</p>

              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                Get Started <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* Employer Card */}
            <motion.button
              whileHover={{ scale: 1.03, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/employer_registration')}
              className="group relative flex flex-col items-center justify-center p-8 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 rounded-3xl transition-all duration-300 overflow-hidden text-center h-64 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/10">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I am an Employer</h3>
              <p className="text-slate-400 text-sm mb-4">Post job listings and hire local skilled workers</p>

              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                Hire Now <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        </section>

        {/* Features Showcase Section */}
        <section id="features" className="px-6 py-24 border-t border-white/5 bg-slate-900/20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-white mb-4">Why Choose Jeebika?</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Features built specifically to make local daily hiring fast, effortless, and accessible to everyone.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2">Voice First</h3>
                <p className="text-slate-400 text-sm leading-relaxed">No complex form filling or typing needed. Input specifications using voice messages directly.</p>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2">Secure Verification</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Fast OTP-based registration and verification process keeps accounts secure and genuine.</p>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2">Distance-based Routing</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Our advanced algorithm ranks jobs automatically based on proximity to the worker's home.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-6 py-24 border-t border-white/5 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-white mb-4">Simple Hiring Process</h2>
              <p className="text-slate-400 max-w-xl mx-auto">How workers get matched and start working in minutes.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 font-bold text-indigo-400">1</div>
                <h4 className="font-bold text-white mb-1">Verify Profile</h4>
                <p className="text-slate-400 text-xs px-4">Register with OTP and location to create your profile.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 font-bold text-cyan-400">2</div>
                <h4 className="font-bold text-white mb-1">Apply with One Click</h4>
                <p className="text-slate-400 text-xs px-4">Submit your details and wage expectation instantly.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 font-bold text-purple-400">3</div>
                <h4 className="font-bold text-white mb-1">SMS Notification</h4>
                <p className="text-slate-400 text-xs px-4">Employer is notified immediately via text message.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 font-bold text-emerald-400">4</div>
                <h4 className="font-bold text-white mb-1">Text to Confirm</h4>
                <p className="text-slate-400 text-xs px-4">Employer replies 0 or 1 to accept or decline the hire.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 px-6 py-8 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-slate-300">Jeebika</span>
            <p className="text-xs text-slate-500 mt-1">&copy; {new Date().getFullYear()} Jeebika Job Platform. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-indigo-400" /> Hackathon Project</span>
            <span className="flex items-center gap-1"><Mic className="w-3 h-3 text-cyan-400" /> Voice-Powered AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
