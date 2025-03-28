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
// Ensure the service account dental-appointments@eco-volt-454704-a0.iam.gserviceaccount.com has "Make changes to events" 
// permission on the primary calendar of ugrarapusivaprathap@gmail.com.
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
        // Validate required fields
        const { name, email, phone, date, time, service } = req.body;
        const notes = req.body.notes || '';
        
        if (!name || !email || !phone || !date || !time || !service) {
            console.error('Missing required fields:', req.body);
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }
        
        console.log('Received appointment request:', req.body);
        
        // Check if the requested time slot is available
        const timeStart = new Date(`${date}T${time}:00`);
        const timeEnd = new Date(timeStart);
        timeEnd.setMinutes(timeEnd.getMinutes() + 30);
        
        try {
            const existingEvents = await calendar.events.list({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                timeMin: timeStart.toISOString(),
                timeMax: timeEnd.toISOString(),
                singleEvents: true
            });
            
            if (existingEvents.data.items && existingEvents.data.items.length > 0) {
                console.log('Slot already booked:', existingEvents.data.items);
                return res.status(400).json({ 
                    success: false,
                    error: 'Slot is already booked' 
                });
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            if (error.response && error.response.status === 403) {
                return res.status(403).json({ 
                    success: false,
                    error: 'Calendar access denied' 
                });
            }
            // Continue with booking attempt if we couldn't check availability
        }

        // Create event on Google Calendar
        const event = {
            summary: `Dental Appointment - ${name}`,
            description: `Service: ${service}\nPhone: ${phone}\nEmail: ${email}\nNotes: ${notes}`,
            start: {
                dateTime: timeStart.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: timeEnd.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
        };

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            resource: event,
        });

        res.status(201).json({
            success: true,
            message: 'Appointment scheduled successfully',
            eventId: response.data.id
        });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        
        // Handle specific Google API errors
        if (error.response) {
            if (error.response.status === 403) {
                return res.status(403).json({ 
                    success: false,
                    error: 'Calendar access denied' 
                });
            } else if (error.response.status === 400) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid request' 
                });
            }
        }
        
        // Generic error response
        res.status(500).json({ 
            success: false,
            error: 'Failed to book appointment: ' + error.message 
        });
    }
});

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }
        
        console.log(`Contact form submission: ${name} (${email}): ${message}`);

        // Here you could add code to send an email notification or store in a database

        res.status(200).json({ 
            success: true,
            message: 'Message received successfully' 
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to process contact form: ' + error.message 
        });
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true,
        status: 'Server is running' 
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 
