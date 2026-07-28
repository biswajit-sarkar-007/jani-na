import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, CheckCircle2, User, MapPin, Loader2, Building, AlertCircle, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const EmployerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [addressObj, setAddressObj] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError('');
    
    // Ensure phone has country code
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      setError('Please include country code (e.g., +1 for US, +91 for India)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      const data = await response.json();

      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();

      if (data.success) {
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server.');
    }
    setLoading(false);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name,
          role: 'employer',
          lat,
          lon,
          addressObj
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Save phone to localStorage for session persistence
        localStorage.setItem('employerPhone', phone);
        localStorage.setItem('employerName', name);
        setStep(4);
      } else {
        setError(data.error || 'Failed to register.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server for registration.');
    }
    setLoading(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "VoiceJobPlatform" } }
          );
          const data = await res.json();
          setAddress(data.display_name); // full readable address
          setLat(data.lat);
          setLon(data.lon);
          setAddressObj(data.address);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch address from coordinates');
        }
        setFetchingLocation(false);
      },
      (err) => {
        console.error(err);
        setError('Failed to get your location. Please allow location access.');
        setFetchingLocation(false);
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 p-6 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative"
      >
        <button 
          onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate('/')}
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center z-10"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
        </button>

        <div className="text-center mt-6 mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Employer Registration</h2>
          <p className="text-slate-400 text-sm">Join our platform to hire skilled workers</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="relative h-[250px] overflow-hidden">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <form onSubmit={handleSendOTP} className="flex flex-col h-full">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Make sure to include your country code (e.g. +91)</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="mt-auto w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP via SMS'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <form onSubmit={handleVerifyOTP} className="flex flex-col h-full">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
                    <p className="text-xs text-slate-400 mb-4">We sent a verification code to {phone}</p>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-center tracking-[0.5em] text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="------"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="mt-auto w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <form onSubmit={handleFinalSubmit} className="flex flex-col h-full">
                  <div className="space-y-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="Company or Full Name"
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="block w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="Full Address"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={fetchingLocation}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400 disabled:opacity-50"
                        title="Get current location"
                      >
                        {fetchingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !name || !address}
                    className="mt-auto w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Profile'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Welcome, {name}!</h3>
                <p className="text-slate-400 mb-8">Your employer profile has been verified.</p>
                <button
                  onClick={() => navigate('/employer_dashboard')}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-full transition-colors"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployerRegistration;
