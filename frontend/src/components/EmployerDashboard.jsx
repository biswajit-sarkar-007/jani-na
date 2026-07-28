import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, X, MapPin, Clock, Users, DollarSign,
  Calendar, FileText, Loader2, Navigation, AlertCircle,
  CheckCircle2, PlayCircle, XCircle, ChevronRight, ChevronDown, User, Phone
} from 'lucide-react';

const STATUS_CONFIG = {
  'Open': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  'In Progress': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: PlayCircle },
  'Done': { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: CheckCircle2 },
  'Cancelled': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const defaultForm = {
  title: '',
  workersCount: '',
  date: '',
  startTime: '',
  duration: '',
  wage: '',
  description: '',
  location: '',
};

const JobCard = ({ job, idx }) => {
  const [expanded, setExpanded] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplicants = async () => {
    try {
      setLoadingApps(true);
      const res = await fetch(`${BACKEND_URL}/applications/job/${job._id}`);
      const data = await res.json();
      if (data.success) {
        setApplicants(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && applicants.length === 0) {
      fetchApplicants();
    }
  };

  const handleAction = async (appId, action) => {
    try {
      setActionLoading(appId);
      const res = await fetch(`${BACKEND_URL}/applications/${appId}/${action}`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: data.application.status } : a));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG['Open'];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/20 rounded-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-start gap-5 p-5 cursor-pointer" onClick={toggleExpand}>
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Briefcase className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-white text-lg leading-tight">{job.title}</h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {job.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            <span className="flex items-center gap-1.5 text-slate-400 text-sm">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-xs">{job.location}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 text-sm">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {job.date}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 text-sm">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {job.workersCount} workers
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 text-sm">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              {job.wage}
            </span>
          </div>
          {job.description && (
            <p className="text-slate-500 text-sm mt-2 line-clamp-2">{job.description}</p>
          )}
        </div>
        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-2 text-slate-400">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Applicants for this Job
              </h4>
              {loadingApps ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              ) : applicants.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No applicants yet.</p>
              ) : (
                <div className="space-y-3">
                  {applicants.map(app => (
                    <div key={app._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{app.workerName}</span>
                          {app.status === 'pending' && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Pending</span>}
                          {app.status === 'accepted' && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Accepted</span>}
                          {app.status === 'rejected' && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/20 uppercase tracking-wider">Rejected</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3" /> {app.workerLocation || 'N/A'}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-400"><DollarSign className="w-3 h-3" /> ₹{app.wageExpectation || job.wage}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-400"><Phone className="w-3 h-3" /> {app.workerPhone}</span>
                        </div>
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            disabled={actionLoading === app._id}
                            onClick={() => handleAction(app._id, 'accept')}
                            className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            disabled={actionLoading === app._id}
                            onClick={() => handleAction(app._id, 'reject')}
                            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmployerDashboard = () => {
  const employerPhone = localStorage.getItem('employerPhone') || '';
  const employerName = localStorage.getItem('employerName') || 'Employer';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/jobs?employerPhone=${encodeURIComponent(employerPhone)}`);
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employerPhone) fetchJobs();
  }, [employerPhone]);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'VoiceJobPlatform' } }
          );
          const data = await res.json();
          setForm(prev => ({ ...prev, location: data.display_name }));
        } catch {
          setFormError('Failed to fetch address. Please type manually.');
        } finally {
          setFetchingLocation(false);
        }
      },
      () => {
        setFormError('Location access denied. Please type address manually.');
        setFetchingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const { title, workersCount, date, startTime, duration, wage, description, location } = form;
    if (!title || !workersCount || !date || !startTime || !duration || !wage || !description || !location) {
      setFormError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerPhone,
          title,
          workersCount: Number(workersCount),
          date,
          startTime,
          duration,
          wage: Number(wage),
          description,
          location,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm(defaultForm);
        await fetchJobs();
      } else {
        setFormError(data.error || 'Failed to create job.');
      }
    } catch {
      setFormError('Failed to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">Employer Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">Welcome, {employerName}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModal(true); setFormError(''); setForm(defaultForm); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Your Job Listings</h2>
          <p className="text-slate-400 text-sm mt-1">Manage all the jobs you have posted</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 text-sm">Click the "Create Job" button to post your first job</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <JobCard key={job._id} job={job} idx={idx} />
            ))}
          </div>
        )}
      </main>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-white">Create New Job</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Fill in the details to post a job</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto flex-1 p-6">
                  {formError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{formError}</p>
                    </div>
                  )}

                  <form id="job-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Job Title */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Job Title</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          name="title"
                          value={form.title}
                          onChange={handleFormChange}
                          placeholder="e.g. Construction Worker Needed"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Workers & Wage */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">No. of Workers</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Users className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            name="workersCount"
                            type="number"
                            min="1"
                            value={form.workersCount}
                            onChange={handleFormChange}
                            placeholder="e.g. 5"
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Wage (₹/day)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <DollarSign className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            name="wage"
                            type="number"
                            min="0"
                            value={form.wage}
                            onChange={handleFormChange}
                            placeholder="e.g. 500"
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date & Start Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all [color-scheme:dark]"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Time</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Clock className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            name="startTime"
                            type="time"
                            value={form.startTime}
                            onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all [color-scheme:dark]"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Clock className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          name="duration"
                          value={form.duration}
                          onChange={handleFormChange}
                          placeholder="e.g. 8 hours / 3 days"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <MapPin className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          name="location"
                          value={form.location}
                          onChange={handleFormChange}
                          placeholder="Job site address"
                          className="w-full pl-10 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={fetchingLocation}
                          title="Use current location"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
                        >
                          {fetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Work Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Describe the work to be done..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                        required
                      />
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/5 shrink-0 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    form="job-form"
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 shadow-lg shadow-cyan-500/20"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Job'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployerDashboard;
