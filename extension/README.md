# CareerPilot AI — Chrome Extension

Manifest V3 browser extension for 1-click job description extraction, candidate match scoring, and smart form autofill.

## Installation Instructions

1. Open Google Chrome (or any Chromium browser like Microsoft Edge or Brave).
2. Navigate to `chrome://extensions` in your browser address bar.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `extension/` directory from this repository (`c:\Users\nmaml\OneDrive\Desktop\CareerOs\extension`).
6. The **CareerPilot AI — Application Assistant** extension icon will now appear in your browser toolbar!

## Usage Guide

1. Ensure the FastAPI backend server is running on `http://localhost:8000`.
2. Click the CareerPilot AI extension icon in your browser toolbar.
3. Paste your JWT Bearer token into the Auth Token input field and click **Save** (you can copy your JWT token from the CareerPilot web app dashboard).
4. Navigate to any job posting (e.g. LinkedIn, Indeed, Greenhouse, Lever).
5. Click **Extract & Analyze Job Description** to calculate match score % and missing skills.
6. Navigate to any application form and click **Autofill Active Application Form** to populate input fields automatically with your AI Memory data.
