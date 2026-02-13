import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import registrationRoutes from './routes/registrations.js';
import contactRoutes from './routes/contact.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/registrations', registrationRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Workshop data endpoint
app.get('/api/workshop/info', (req, res) => {
  res.json({
    success: true,
    workshop: {
      name: 'Ascend Leadership Workshop',
      tagline: 'Elevate Your Vision. Inspire Success.',
      date: 'March 15, 2024',
      location: 'Premium Conference Center',
      duration: '1 Day',
      capacity: 500,
      speakers: [
        {
          id: 1,
          name: 'Alex Morgan',
          title: 'CEO and Visionary Leader',
          expertise: 'Strategic Leadership & Innovation',
          bio: 'With 20+ years of experience in building successful startups'
        },
        {
          id: 2,
          name: 'Sophia Lee',
          title: 'Growth Strategist & Author',
          expertise: 'Scaling Businesses & Team Building',
          bio: 'Leading enterprise transformation initiatives globally'
        },
        {
          id: 3,
          name: 'Daniel Brooks',
          title: 'Innovation Director',
          expertise: 'Product Development & Market Disruption',
          bio: 'Pioneering breakthrough solutions in emerging markets'
        }
      ],
      schedule: [
        { time: '9:00 AM', event: 'Registration & Welcome' },
        { time: '9:30 AM', event: 'Keynote: Visionary Leadership' },
        { time: '10:30 AM', event: 'Session 1: Strategy Clarity' },
        { time: '11:45 AM', event: 'Coffee Break' },
        { time: '12:00 PM', event: 'Session 2: Innovation Techniques' },
        { time: '1:15 PM', event: 'Lunch Break' },
        { time: '2:15 PM', event: 'Panel Discussion: Growth Strategies' },
        { time: '3:30 PM', event: 'Networking & Closing Remarks' }
      ]
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`✨ Ascend Leadership API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
