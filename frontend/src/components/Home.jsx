import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, HardHat, Mic, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 p-6 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md">
          <Mic className="w-4 h-4" />
          <span>Voice-First Job Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Find your next job with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">just your voice.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          The easiest way to connect workers and employers. No typing required. Speak your needs, and we'll handle the rest.
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          {/* Worker Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/worker_registration')}
            className="group relative flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-3xl transition-all duration-300 overflow-hidden text-left h-64"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <HardHat className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">I am a Worker</h3>
            <p className="text-slate-400 text-center text-sm mb-4">Looking for jobs and daily wages</p>
            
            <div className="flex items-center text-indigo-400 font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </motion.button>

          {/* Employer Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/employer_registration')}
            className="group relative flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-3xl transition-all duration-300 overflow-hidden text-left h-64"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">I am an Employer</h3>
            <p className="text-slate-400 text-center text-sm mb-4">Looking to hire skilled workers</p>
            
            <div className="flex items-center text-cyan-400 font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              Hire Now <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
