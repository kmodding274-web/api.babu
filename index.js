const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://story.appsdone.online';

// 1. Aapki Teeno Local JSON Files Import
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');
const watchedData = require('./watched.json');

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// JSON Helper Function
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}

// ---------------- LOCAL CUSTOM ENDPOINTS ----------------

// 1. Subscription API (Local File se)
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

// 2. Subscription State API (Local File se)

// 3. Homepage Struct API (Local File se)
app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

app.get('/feedservice/v1/shows/watched', (req, res) => {
    sendJsonWithCdnProxy(res, req, watchedData);
});
// ---------------- LIVE PROXY HANDLER (Baaki sab ke liye) ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        const getForwardHeaders = (req) => {
    return {
        'authorization': req.headers['authorization'] || '',
        'appversion': req.headers['appversion'] || '17',
        'platform': req.headers['platform'] || '0',
        'deviceid': req.headers['deviceid'] || 'acac549b0ef02489',
        'os': req.headers['os'] || 'Android 16 (API 36)',
        'network_type': req.headers['network_type'] || 'CELLULAR',
        'ep_session_id': req.headers['ep_session_id'] || '',
        'sessionid': req.headers['sessionid'] || '',
        'user-agent': req.headers['user-agent'] || 'ktor-client',
        'content-type': 'application/json',
        'accept': 'application/json',
        'ts': Math.floor(Date.now() / 1000).toString()
    };

        const fetchOptions = {
            method: req.method,
            headers: headers
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).json({
            status: "PROXY_ERROR",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running live on port ${PORT}`);
});
