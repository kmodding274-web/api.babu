const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://story.appsdone.online';

// Local JSON Files
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');

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

// Helper Function
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}

// ---------------- LOCAL CUSTOM ENDPOINTS ----------------

app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

// ---------------- LIVE PROXY HANDLER (Mobile Data + Wi-Fi Fixed) ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        // Dynamic Header Copying (Forward incoming headers cleanly)
        const headers = {
            'appVersion': req.headers['appversion'] || '14',
            'platform': req.headers['platform'] || '0',
            'deviceId': req.headers['deviceid'] || '5de5d3c427dcb215',
            'os': req.headers['os'] || 'Android 16 (API 36)',
            'network_type': req.headers['network_type'] || 'MOBILE', // Dynamic setup
            'X-AYUSH-KEY': req.headers['x-ayush-key'] || 'LEGEND_2026_SECRET',
            'Authorization': req.headers['authorization'] || 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IlN1biBKdW4gMjggMTU6Mjk6MzQgVVRDIDIwMjYiLCJzZXNzaW9uSWQiOiIxNDMzMDU4NSIsImRldmljZUlkIjoiNWRlNWQzYzQyN2RjYjIxNSIsInN1YiI6IjEyMjcxODY5IiwiZXhwIjoxNzgyOTE5Nzc0fQ.z8f023DCzpzGg3J1t4VHloQWBtcPxi9PbxkqP_zl4PQ',
            'User-Agent': req.headers['user-agent'] || 'ktor-client',
            'Content-Type': 'application/json',
            'ts': Math.floor(Date.now() / 1000).toString(),
            'Host': 'story.appsdone.online' // Required for Mobile Data Routing
        };

        const fetchOptions = {
            method: req.method,
            headers: headers
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        // AbortController to prevent Mobile Data Timeout hanging
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000); // 12 seconds
        fetchOptions.signal = controller.signal;

        const response = await fetch(targetUrl, fetchOptions);
        clearTimeout(timeout);

        // Raw Response Handling
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { rawResponse: responseText };
        }

        res.status(response.status).json(data);

    } catch (error) {
        console.error("Proxy Error Details:", error.message);
        res.status(500).json({
            status: "PROXY_ERROR",
            message: error.name === 'AbortError' ? 'Target server timed out on Mobile Network' : error.message
        });
    }
});

// Bind to 0.0.0.0 so external/mobile connections can enter
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running globally on port ${PORT}`);
});
