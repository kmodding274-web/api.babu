const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS package ki jagah ye middleware use karein:
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, appVersion, platform, deviceId, os, network_type, X-AYUSH-KEY, ts");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Baaki aapke saare JSON imports aur routes niche waise hi rahenge...


// JSON Files Import
const subscriptionData = require('./subscription.json');
const stateData = require('./state.json');
const profileData = require('./profile.json');
const detailsData = require('./details.json');
const languageData = require('./languages.json');
const cwData = require('./cw.json');
const expData = require('./experiment.json');
const structData = require('./struct.json');

// List JSON Files

// ---------------- USER SERVICE ENDPOINTS ----------------

// 1. Subscription API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    res.json(subscriptionData);
});

// 2. Subscription State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    res.json(stateData);
});

// 3. Profile API
app.get('/userservice/v1/profile', (req, res) => {
    res.json(profileData);
});

// 4. Languages API
app.get('/userservice/v1/languages', (req, res) => {
    res.json(languageData);
});

// 5. Experiments API
app.get('/userservice/v1/experiments', (req, res) => {
    res.json(expData);
});

// 6. Device Register API (POST Request)
app.post('/userservice/v1/device/ids', (req, res) => {
    const { fcmtoken } = req.body;
    res.json({
        status: "SUCCESS",
        message: "Device registered successfully",
        fcmtoken: fcmtoken || null
    });
});

// ---------------- FEED SERVICE ENDPOINTS ----------------

// 7. Category Details API
app.get('/feedservice/v1/category/details', (req, res) => {
    res.json(detailsData);
});

// 8. Continue Watching API
app.get('/feedservice/v1/show/cw', (req, res) => {
    res.json(cwData);
});

// 9. Homepage Structure API
app.get('/feedservice/v1/homepage/struct', (req, res) => {
    res.json(structData);
});

// 10. Dynamic Shows/Lists API (10446, 10636, 10638 etc.)


    // Mapping section IDs to their JSON files
    

// ---------------- ANALYTICS ENDPOINTS ----------------

// 11. Impression Tracking API
app.post('/analytics/v1/impression', (req, res) => {
    res.json({
        status: "SUCCESS",
        message: "Impression tracked successfully"
    });
});

// Health check endpoint (Render Server sleep alert check ke liye)
app.get('/', (req, res) => {
    res.send("API Server is running live!");
});

// Server Listening
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
