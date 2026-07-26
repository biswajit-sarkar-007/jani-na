const express = require('express');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerPhone: { type: String, required: true },
  workerName: { type: String, required: true },
  workerLocation: { type: String },
  wageExpectation: { type: Number },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
applicationSchema.index({ jobId: 1, workerPhone: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

// ── Twilio ─────────────────────────────────────────────────────────────────────
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

async function sendSMS(to, body) {
  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('TWILIO_PHONE_NUMBER is not set, skipping SMS:', body);
    return;
  }
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`SMS sent to ${to}`);
  } catch (err) {
    console.error('SMS send error:', err.message);
  }
}

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

// ── Applications & SMS Workflow ────────────────────────────────────────────────
app.post('/applications', async (req, res) => {
  try {
    const { jobId, workerPhone, workerName, workerLocation, wageExpectation } = req.body;
    if (!jobId || !workerPhone || !workerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const existingApp = await Application.findOne({ jobId, workerPhone });
    if (existingApp) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    const app = new Application({
      jobId, workerPhone, workerName, workerLocation, wageExpectation
    });
    await app.save();

    // Notify Employer
    const msg = `[Jani-Na] Worker ${workerName} from ${workerLocation || 'nearby'} (Wage: ₹${wageExpectation || job.wage}/day) applied for '${job.title}'. Reply exactly 0 to ACCEPT or 1 to REJECT.`;
    await sendSMS(job.employerPhone, msg);

    res.status(201).json({ success: true, application: app });
  } catch (error) {
    console.error('Apply Error:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

app.get('/applications/worker/:phone', async (req, res) => {
  try {
    const applications = await Application.find({ workerPhone: req.params.phone })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/applications/job/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

app.put('/applications/:id/accept', async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true }).populate('jobId');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const msg = `[Jani-Na] Congratulations! Your application for '${app.jobId.title}' has been ACCEPTED by the employer. Please check your dashboard for details.`;
    await sendSMS(app.workerPhone, msg);

    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept application' });
  }
});

app.put('/applications/:id/reject', async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true }).populate('jobId');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const msg = `[Jani-Na] Your application for '${app.jobId.title}' has been declined. Keep looking — more opportunities are available on your dashboard!`;
    await sendSMS(app.workerPhone, msg);

    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

// GET test endpoint — open YOUR_CLOUDFLARE_URL/sms-reply in a browser to verify tunnel works
app.get('/sms-reply', (req, res) => {
  console.log('✅ GET /sms-reply hit — tunnel is working!');
  res.json({ success: true, message: 'SMS reply webhook is reachable!' });
});

app.post('/sms-reply', async (req, res) => {
  const { MessagingResponse } = twilio.twiml;
  const twiml = new MessagingResponse();

  // ── DEBUG: Log everything Twilio sends us ──
  console.log('========================================');
  console.log('📩 INCOMING SMS WEBHOOK HIT');
  console.log('Full req.body:', JSON.stringify(req.body, null, 2));
  console.log('From:', req.body.From);
  console.log('Body:', req.body.Body);
  console.log('To:', req.body.To);
  console.log('========================================');

  try {
    const fromPhone = req.body.From;
    const text = req.body.Body ? req.body.Body.trim() : '';

    if (!fromPhone) {
      console.log('❌ No From phone number found in request');
      twiml.message("Error: Could not identify your phone number.");
      return res.type('text/xml').send(twiml.toString());
    }

    // Find jobs belonging to this employer
    console.log(`🔍 Looking for jobs with employerPhone: "${fromPhone}"`);
    const employerJobs = await Job.find({ employerPhone: fromPhone }).select('_id title');
    console.log(`📋 Found ${employerJobs.length} jobs for this employer:`, employerJobs.map(j => j.title));

    if (employerJobs.length === 0) {
      // Maybe phone format mismatch — log all unique employer phones for debugging
      const allPhones = await Job.distinct('employerPhone');
      console.log('⚠️ No jobs found! All employer phones in DB:', allPhones);
      console.log('⚠️ Incoming phone was:', fromPhone);
      twiml.message("No jobs found for your phone number. Make sure you are replying from the same number you registered with.");
      return res.type('text/xml').send(twiml.toString());
    }

    const jobIds = employerJobs.map(j => j._id);

    // Find the most recent pending application for any of this employer's jobs
    const latestApp = await Application.findOne({
      jobId: { $in: jobIds },
      status: 'pending'
    }).sort({ createdAt: -1 }).populate('jobId');

    console.log('📝 Latest pending application:', latestApp ? `${latestApp.workerName} for ${latestApp.jobId?.title}` : 'NONE');

    if (!latestApp) {
      twiml.message("No pending applications found to respond to.");
      return res.type('text/xml').send(twiml.toString());
    }

    if (text === '0') {
      latestApp.status = 'accepted';
      await latestApp.save();
      console.log(`✅ ACCEPTED ${latestApp.workerName}'s application`);

      const workerMsg = `[Jani-Na] Congratulations! Your application for '${latestApp.jobId.title}' has been ACCEPTED.`;
      await sendSMS(latestApp.workerPhone, workerMsg);

      twiml.message(`You have ACCEPTED ${latestApp.workerName}'s application for '${latestApp.jobId.title}'.`);
    } else if (text === '1') {
      latestApp.status = 'rejected';
      await latestApp.save();
      console.log(`❌ REJECTED ${latestApp.workerName}'s application`);

      const workerMsg = `[Jani-Na] Your application for '${latestApp.jobId.title}' has been declined. Keep looking on your dashboard!`;
      await sendSMS(latestApp.workerPhone, workerMsg);

      twiml.message(`You have REJECTED ${latestApp.workerName}'s application for '${latestApp.jobId.title}'.`);
    } else {
      console.log(`⚠️ Invalid reply text: "${text}"`);
      twiml.message(`Invalid response "${text}". Please reply exactly 0 to ACCEPT or 1 to REJECT.`);
    }

  } catch (err) {
    console.error("SMS Reply Error:", err);
    twiml.message("An error occurred processing your request.");
  }

  res.type('text/xml').send(twiml.toString());
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
