import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, Users, DollarSign,
  Calendar, Loader2, Star, Zap, TrendingUp, Navigation2,
  ChevronDown, ChevronUp, AlertCircle, Search, CheckCircle2, XCircle
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const getStatusStyle = (status) => {
  const styles = {
    'Open': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Done': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return styles[status] || styles['Open'];
};

const ScoreBadge = ({ score }) => {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-slate-400';
  const ring = pct >= 70 ? 'ring-emerald-500/30' : pct >= 40 ? 'ring-amber-500/30' : 'ring-slate-500/30';
  return (
    <div className={` `}>
      {/* <Star className="w-3 h-3" /> */}
      {/* {pct}% match */}
    </div>
  );
};

const JobCard = ({ job, index, workerPhone, workerName, onApplySuccess }) => {
  const [expanded, setExpanded] = useState(false);
  const [wageExpectation, setWageExpectation] = useState(job.wage);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!workerPhone || !workerName) {
      setApplyError('Worker session not found');
      return;
    }
    setApplying(true);
    setApplyError('');
    try {
      const location = localStorage.getItem('workerLocation') || '';
      const res = await fetch(`${BACKEND_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          workerPhone,
          workerName,
          workerLocation: location,
          wageExpectation: Number(wageExpectation) || job.wage
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplied(true);
        if (onApplySuccess) onApplySuccess();
      } else {
        setApplyError(data.error || 'Failed to apply');
      }
    } catch (err) {
      setApplyError('Failed to connect to server');
    } finally {
      setApplying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/20 rounded-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank indicator */}
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
            {index === 0 ? (
              <Zap className="w-5 h-5 text-indigo-400" />
            ) : index <= 2 ? (
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            ) : (
              <Briefcase className="w-5 h-5 text-indigo-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h3 className="font-semibold text-white text-base leading-snug">{job.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <ScoreBadge score={job.finalScore} />
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusStyle(job.status)}`}>
                  {job.status}
                </span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate max-w-[200px]">{job.location}</span>
              </span>
              {job.distanceKm !== null && job.distanceKm !== undefined && (
                <span className="flex items-center gap-1 text-indigo-400 text-xs font-semibold">
                  <Navigation2 className="w-3 h-3" />
                  {job.distanceKm} km away
                </span>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2">
              <span className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                {job.wage}/day
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {job.workersCount} workers needed
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {job.date}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {job.startTime} · {job.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full justify-end"
        >
          {expanded ? 'Hide details' : 'Show details'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 overflow-hidden"
          >
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Work Description</p>
                <p className="text-slate-300 text-sm leading-relaxed">{job.description}</p>
              </div>
              <div className="pt-2 space-y-3">
                {applyError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {applyError}
                  </div>
                )}
                {!applied && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Your Wage Expectation (₹/day)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <input
                        type="number"
                        value={wageExpectation}
                        onChange={(e) => setWageExpectation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleApply}
                  disabled={applying || applied}
                  className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 ${applied ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 disabled:opacity-50'
                    }`}
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : applied ? <><CheckCircle2 className="w-4 h-4" /> Applied</> : 'Apply for this Job'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const WorkerDashboard = () => {
  const workerPhone = localStorage.getItem('workerPhone') || '';
  const workerName = localStorage.getItem('workerName') || 'Worker';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverWorkerName, setServerWorkerName] = useState('');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const fetchJobs = async () => {
    if (!workerPhone) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${BACKEND_URL}/worker_dashboard/${encodeURIComponent(workerPhone)}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setServerWorkerName(data.workerName || workerName);
      } else {
        setError(data.error || 'Failed to load jobs.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    if (!workerPhone) return;
    try {
      setLoadingApps(true);
      const res = await fetch(`${BACKEND_URL}/applications/worker/${encodeURIComponent(workerPhone)}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const displayName = serverWorkerName || workerName;
  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">Job Feed</h1>
              <p className="text-xs text-slate-500 mt-0.5">Welcome, {displayName}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs or location..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Section title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recommended Jobs</h2>
            <p className="text-slate-400 text-sm mt-1">
              Sorted by proximity, wage, and urgency
            </p>
          </div>
          {!loading && jobs.length > 0 && (
            <span className="text-slate-500 text-sm">{filteredJobs.length} jobs</span>
          )}
        </div>

        {/* Legend */}
        {!loading && jobs.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-5 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Top pick</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> High match</span>
            <span className="flex items-center gap-1"><Navigation2 className="w-3.5 h-3.5 text-indigo-400" /> Distance from you</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-indigo-400" /> Match score</span>
          </div>
        )}

        {/* States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Finding best jobs near you...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 text-center py-20">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-red-400 text-sm max-w-sm">{error}</p>
            <button onClick={fetchJobs} className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl transition-colors">
              Retry
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {search ? 'No results found' : 'No jobs available nearby'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              {search
                ? 'Try a different search term.'
                : 'There are no open jobs within 50km of your location right now. Check back later!'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, i) => (
              <JobCard key={job._id} job={job} index={i} workerPhone={workerPhone} workerName={displayName} onApplySuccess={fetchApplications} />
            ))}
          </div>
        )}

        {/* My Applications Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">My Applications</h2>
          {loadingApps ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <p className="text-slate-400 text-sm">You haven't applied to any jobs yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app._id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{app.jobId?.title || 'Unknown Job'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-slate-400 text-xs">
                        <MapPin className="w-3 h-3" /> {app.jobId?.location || 'Unknown Location'}
                      </span>
                    </div>
                  </div>
                  <div>
                    {app.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>}
                    {app.status === 'accepted' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Accepted</span>}
                    {app.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> Rejected</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
