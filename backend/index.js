const express = require('express');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ── Geocoding Utility ──────────────────────────────────────────────────────────
async function geocodeAddress(locationString) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`,
      { headers: { 'User-Agent': 'VoiceJobPlatform' } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ── Mongoose Schemas & Models ──────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['worker', 'employer'], required: true },
  location: {
    lat: String,
    lon: String,
    addressObj: mongoose.Schema.Types.Mixed
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  employerPhone: { type: String, required: true },
  title: { type: String, required: true },
  workersCount: { type: Number, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  wage: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true }, // human-readable
  coordinates: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [lon, lat] — GeoJSON order!
  },
  status: { type: String, enum: ['Open', 'In Progress', 'Done', 'Cancelled'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

// Required for $geoNear / $nearSphere queries
jobSchema.index({ coordinates: '2dsphere' });

const Job = mongoose.model('Job', jobSchema);

// ── Twilio ─────────────────────────────────────────────────────────────────────
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// ── OTP Routes ─────────────────────────────────────────────────────────────────
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phone, channel: 'sms' });
    res.json({ success: true, status: verification.status });
  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });
  try {
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phone, code: otp });
    if (verificationCheck.status === 'approved') {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
});

// ── User Registration ──────────────────────────────────────────────────────────
app.post('/register', async (req, res) => {
  try {
    const { phone, name, role, lat, lon, addressObj } = req.body;
    if (!phone || !name || !role) {
      return res.status(400).json({ error: 'Phone, name, and role are required' });
    }
    const newUser = new User({
      phone, name, role,
      location: { lat: lat || null, lon: lon || null, addressObj: addressObj || null }
    });
    await newUser.save();
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// ── Job Routes ─────────────────────────────────────────────────────────────────
app.post('/jobs', async (req, res) => {
  try {
    const { employerPhone, title, workersCount, date, startTime, duration, wage, description, location } = req.body;
    if (!employerPhone || !title || !workersCount || !date || !startTime || !duration || !wage || !description || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Geocode the location string to get coordinates
    const geo = await geocodeAddress(location);

    const jobData = { employerPhone, title, workersCount, date, startTime, duration, wage, description, location };
    if (geo) {
      jobData.coordinates = { type: 'Point', coordinates: [geo.lon, geo.lat] }; // GeoJSON: [lon, lat]
    }

    const newJob = new Job(jobData);
    await newJob.save();
    res.status(201).json({ success: true, job: newJob });
  } catch (error) {
    console.error('Job Creation Error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.get('/jobs', async (req, res) => {
  try {
    const { employerPhone } = req.query;
    if (!employerPhone) return res.status(400).json({ error: 'employerPhone is required' });
    const jobs = await Job.find({ employerPhone }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ── Worker Dashboard — Geospatial + Scoring ────────────────────────────────────
app.get('/worker_dashboard/:phone', async (req, res) => {
  try {
    const worker = await User.findOne({ phone: req.params.phone, role: 'worker' });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const workerLat = parseFloat(worker.location?.lat);
    const workerLon = parseFloat(worker.location?.lon);

    let scoredJobs;

    if (!isNaN(workerLat) && !isNaN(workerLon)) {
      // Worker has geo data — use MongoDB $geoNear (production-grade, handles distance natively)
      const MAX_DISTANCE_METERS = 50 * 1000; // 50km radius

      const nearbyJobs = await Job.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [workerLon, workerLat] },
            distanceField: 'distanceMeters',
            maxDistance: MAX_DISTANCE_METERS,
            spherical: true,
            query: { status: 'Open' }
          }
        }
      ]);

      // Weighted scoring: Distance 50% | Wage 30% | Urgency 20%
      scoredJobs = nearbyJobs.map(job => {
        const distanceKm = job.distanceMeters / 1000;
        const distanceScore = Math.max(0, 1 - distanceKm / 50);
        const wageScore = Math.min(job.wage / 1000, 1);

        const daysUntilJob = (new Date(job.date) - new Date()) / (1000 * 60 * 60 * 24);
        const urgencyScore = daysUntilJob <= 3 ? 1 : Math.max(0, 1 - daysUntilJob / 30);

        const finalScore = distanceScore * 0.5 + wageScore * 0.3 + urgencyScore * 0.2;
        return { ...job, distanceKm: parseFloat(distanceKm.toFixed(2)), finalScore };
      });
    } else {
      // No geo data — fall back to recency + wage sort
      const allJobs = await Job.find({ status: 'Open' }).sort({ createdAt: -1 }).limit(50);
      scoredJobs = allJobs.map(job => {
        const daysUntilJob = (new Date(job.date) - new Date()) / (1000 * 60 * 60 * 24);
        const urgencyScore = daysUntilJob <= 3 ? 1 : Math.max(0, 1 - daysUntilJob / 30);
        const wageScore = Math.min(job.wage / 1000, 1);
        const finalScore = wageScore * 0.6 + urgencyScore * 0.4;
        return { ...job._doc, distanceKm: null, finalScore };
      });
    }

    scoredJobs.sort((a, b) => b.finalScore - a.finalScore);
    res.json({ success: true, jobs: scoredJobs, workerName: worker.name });
  } catch (err) {
    console.error('Worker Dashboard Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Migration endpoint — geocode existing jobs without coordinates ──────────────
app.post('/migrate/geocode-jobs', async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [{ coordinates: { $exists: false } }, { 'coordinates.coordinates': { $size: 0 } }]
    });

    let migrated = 0;
    let failed = 0;

    for (const job of jobs) {
      const geo = await geocodeAddress(job.location);
      if (geo) {
        job.coordinates = { type: 'Point', coordinates: [geo.lon, geo.lat] };
        await job.save();
        migrated++;
      } else {
        failed++;
      }
      // Respect Nominatim's 1 req/sec limit
      await new Promise(r => setTimeout(r, 1100));
    }

    res.json({ success: true, migrated, failed, total: jobs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
