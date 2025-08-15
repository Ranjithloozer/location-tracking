Overview
This is a consent-based location tracking application built with HTML, CSS, and JavaScript. It utilizes Leaflet for mapping, the browser's Geolocation API for real-time tracking, and Twilio's Verify API for SMS-based OTP verification. The app includes geofencing, location history, and a user-friendly interface, designed to comply with legal standards (e.g., India’s PDPB 2019) using Twilio’s free trial.

 Features
- Real-Time Tracking: Tracks the device's location every 5 seconds with high accuracy when GPS is enabled.
- Geofencing: Alerts when the user exits or enters a 500m radius from the initial location.
- OTP Verification: Sends a 6-digit OTP via SMS using Twilio for secure, consent-based access.
- Location History: Logs all location updates with timestamps for review.
- Share Location: Generates a dummy link for manual sharing of coordinates (e.g., via WhatsApp).
- Reset Option: Resets the app to start fresh with a new mobile number.

Prerequisites
- A Twilio account with a free trial (no credit card required, ~$15 credit for ~300 SMS to India).
- Verify your mobile number (e.g., +919361211458) in the Twilio Console under Verified Caller IDs.
- A modern web browser with Geolocation support.

 Installation
1. Clone the repository: `git clone https://github.com/yourusername/location-tracking.git`
2. Navigate to the folder: `cd location-tracking`
3. Open `index.html` in a live server (e.g., VS Code Live Server extension) or any web server.

 Usage
1. Enter a valid +91 mobile number (e.g., +919361211458).
2. Click "Send OTP" to receive a 6-digit code via SMS (ensure number is verified in Twilio).
3. Enter the OTP and click "Verify OTP" to start tracking.
4. Allow location access—move outdoors for better accuracy (5-10m with GPS).
5. Use "Stop Tracking," "Share Location Link," or "Reset App" as needed.

Configuration
- Update `script.js` with your Twilio Account SID, Auth Token, and Verify Service SID if different.
- Example credentials are placeholders—replace them with your own from twilio.com.

Troubleshooting
- 403 Forbidden: Verify the mobile number in Twilio Console or check credentials/balance.
- Accuracy Alert: Appears once if >100m—enable GPS and move outdoors.
- No SMS: Ensure Twilio trial credit (~300 SMS total) isn’t exhausted; contact Twilio support if needed.

License
This project is open-source under the MIT License. Feel free to modify and distribute.

 Contributions
Contributions are welcome! Please fork the repository and submit pull requests.

GITHUB LINK : https://ranjithloozer.github.io/location-tracking
