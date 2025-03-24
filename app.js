require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://sivafrontend.vercel.app', // Vercel domain
        'http://localhost:5000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Configure Google Calendar API
const calendar = google.calendar({
    version: 'v3',
    auth: new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/calendar']
    )
});

// Routes
app.post('/api/appointments', async (req, res) => {
    try {
        const { name, email, phone, date, time, service, notes } = req.body;

        // Create event on Google Calendar
        const event = {
            summary: `Dental Appointment - ${name}`,
            description: `Service: ${service}\nPhone: ${phone}\nEmail: ${email}\nNotes: ${notes}`,
            start: {
                dateTime: `${date}T${time}:00`,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: `${date}T${time.split(':')[0]}:${parseInt(time.split(':')[1]) + 30}:00`,
                timeZone: 'Asia/Kolkata',
            },
        };

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            resource: event,
        });

        res.status(201).json({
            message: 'Appointment scheduled successfully',
            eventId: response.data.id
        });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({ error: 'Failed to schedule appointment', details: error.message });
    }
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log(`Contact form submission: ${name} (${email}): ${message}`);
    
    // Here you could add code to send an email notification or store in a database
    
    res.status(200).json({ message: 'Message received' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 