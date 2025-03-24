# Lotus Dental API

Backend API for the Lotus Dental Care website. This API handles appointment scheduling and contact form submissions.

## Features

- Schedule dental appointments (saves to Google Calendar)
- Contact form submission handling
- Health check endpoint

## Tech Stack

- Node.js
- Express.js
- Google Calendar API

## Deployment on Render

### Prerequisites

1. Create a [Google Cloud Platform](https://console.cloud.google.com/) project
2. Set up a service account with Google Calendar API access
3. Create a calendar in Google Calendar and note its ID

### Steps to Deploy

1. Fork or clone this repository
2. Create a new Web Service on [Render](https://render.com/)
3. Connect your repository
4. Use the following configuration:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Root Directory**: (leave blank, it should point to root)
5. Add the following environment variables:
   - `PORT`: 3000 (or leave blank to let Render choose)
   - `GOOGLE_CALENDAR_ID`: Your Google Calendar ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Your service account email
   - `GOOGLE_PRIVATE_KEY`: Your service account private key (with newlines preserved)

## Local Development

1. Clone this repository
2. Create a `.env` file with the required environment variables (see above)
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. For development with auto-reload: `npm run dev`

## API Endpoints

- **POST /api/appointments**: Schedule a new appointment
- **POST /api/contact**: Submit a contact form
- **GET /api/health**: Check if the API is running 