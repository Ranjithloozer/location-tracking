let generatedOTP = null;
let map = null;
let marker = null;
let geofence = null;
let trackingInterval = null;
let initialLat = null;
let initialLng = null;
let locationHistory = [];
let accuracyAlertShown = false; // Flag to limit alert

async function sendOTP() {
    const mobile = document.getElementById('mobile').value;
    if (!mobile.match(/^\+91[0-9]{10}$/)) {
        document.getElementById('status').innerText = 'Please enter a valid +91 mobile number.';
        return;
    }

    const accountSid = 'ACd5b83badc9b6b4912a6e08e6f0ad7d0c';
    const authToken = '2eee9c7e04a8b54b45debbf00d4e5601';
    const verifySid = 'VA0dad02f811fd6b46b8c81845b088bb4f';

    const url = `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`;
    const data = new URLSearchParams({
        To: mobile,
        Channel: 'sms'
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        });

        const result = await response.json();
        console.log('Twilio Response:', result);
        if (response.status === 201 && result.status === 'pending') {
            document.getElementById('otp-label').style.display = 'block';
            document.getElementById('otp').style.display = 'block';
            document.getElementById('verify-btn').style.display = 'block';
            document.getElementById('status').innerText = 'OTP sent via SMS! Check your phone.';
        } else {
            document.getElementById('status').innerText = `Failed to send OTP. Status: ${result.status}. Check Twilio Console (verify number or balance).`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        document.getElementById('status').innerText = `Error sending OTP: ${error.message}. Verify credentials or network.`;
    }
}

async function verifyOTP() {
    const userOTP = document.getElementById('otp').value;
    if (!userOTP) {
        document.getElementById('status').innerText = 'Please enter the OTP.';
        return;
    }

    const mobile = document.getElementById('mobile').value;
    const accountSid = 'ACd5b83badc9b6b4912a6e08e6f0ad7d0c';
    const authToken = '2eee9c7e04a8b54b45debbf00d4e5601';
    const verifySid = 'VA0dad02f811fd6b46b8c81845b088bb4f';

    const url = `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`;
    const data = new URLSearchParams({
        To: mobile,
        Code: userOTP
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        });

        const result = await response.json();
        console.log('Verification Response:', result);
        if (result.status === 'approved') {
            document.getElementById('status').innerText = 'OTP Verified! Accessing location...';
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError, { enableHighAccuracy: true });
            } else {
                document.getElementById('status').innerText = 'Geolocation not supported.';
            }
        } else {
            document.getElementById('status').innerText = `Invalid OTP. Status: ${result.status}. Check SMS or retry.`;
        }
    } catch (error) {
        console.error('Verification Error:', error);
        document.getElementById('status').innerText = `Error verifying OTP: ${error.message}. Check network or Twilio status.`;
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    if (!accuracyAlertShown && position.coords.accuracy > 100) {
        alert('For better accuracy, enable GPS and move outdoors. This alert will not repeat.');
        accuracyAlertShown = true;
    }
    if (!initialLat || !initialLng) {
        initialLat = lat;
        initialLng = lng;
    }
    document.getElementById('status').innerText = `Location: Lat ${lat}, Lng ${lng} (Accuracy: ~${position.coords.accuracy}m)`;
    updateHistory(lat, lng, position.coords.accuracy);
    
    const mapDiv = document.getElementById('map');
    mapDiv.style.display = 'block';
    document.getElementById('stop-btn').style.display = 'block';
    document.getElementById('share-btn').style.display = 'block';
    document.getElementById('reset-btn').style.display = 'block';
    document.getElementById('history').style.display = 'block';
    
    if (!map) {
        map = L.map('map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        marker = L.marker([lat, lng]).addTo(map).bindPopup('Your Location').openPopup();
        geofence = L.circle([initialLat, initialLng], { radius: 500 }).addTo(map);
    } else {
        map.setView([lat, lng], 15);
        marker.setLatLng([lat, lng]);
        checkGeofence(lat, lng);
    }
    
    if (!trackingInterval) {
        trackingInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(updatePosition, showError, { enableHighAccuracy: true });
        }, 5000);
    }
}

function updatePosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    if (!accuracyAlertShown && position.coords.accuracy > 100) {
        alert('For better accuracy, enable GPS and move outdoors. This alert will not repeat.');
        accuracyAlertShown = true;
    }
    document.getElementById('status').innerText = `Updated Location: Lat ${lat}, Lng ${lng} (Accuracy: ~${position.coords.accuracy}m)`;
    updateHistory(lat, lng, position.coords.accuracy);
    map.setView([lat, lng], 15);
    marker.setLatLng([lat, lng]);
    checkGeofence(lat, lng);
}

function checkGeofence(lat, lng) {
    const distance = map.distance([lat, lng], [initialLat, initialLng]);
    if (distance > 500 && !geofence.exited) {
        alert('Exited geofence!');
        geofence.exited = true;
    } else if (distance <= 500 && geofence.exited) {
        alert('Entered geofence!');
        geofence.exited = false;
    }
}

function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
        document.getElementById('status').innerText = 'Tracking stopped.';
        document.getElementById('stop-btn').style.display = 'none';
    }
}

function resetApp() {
    stopTracking();
    document.getElementById('otp-label').style.display = 'none';
    document.getElementById('otp').style.display = 'none';
    document.getElementById('verify-btn').style.display = 'none';
    document.getElementById('map').style.display = 'none';
    document.getElementById('share-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    document.getElementById('status').innerText = 'App reset. Enter new mobile number.';
    locationHistory = [];
    document.getElementById('history').innerHTML = '';
    map = null;
    marker = null;
    geofence = null;
    initialLat = null;
    initialLng = null;
    accuracyAlertShown = false; // Reset alert flag on reset
}

function shareLocation() {
    const lat = initialLat;
    const lng = initialLng;
    const mobile = document.getElementById('mobile').value;
    const shareLink = `https://example.com/share?lat=${lat}&lng=${lng}&mobile=${mobile}`;
    alert(`Share this link with the target: ${shareLink} (Paste in text/WhatsApp for them to consent and track).`);
}

function updateHistory(lat, lng, accuracy) {
    const timestamp = new Date().toLocaleTimeString();
    locationHistory.push({ lat, lng, accuracy, timestamp });
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '<h3>Location History:</h3>' + locationHistory.map(entry =>
        `<p>Lat: ${entry.lat}, Lng: ${entry.lng}, Acc: ${entry.accuracy}m, Time: ${entry.timestamp}</p>`
    ).join('');
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('status').innerText = 'User denied location access. Consent required.';
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('status').innerText = 'Location info unavailable.';
            break;
        case error.TIMEOUT:
            document.getElementById('status').innerText = 'Request timed out.';
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('status').innerText = 'Unknown error.';
            break;
    }
}