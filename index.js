const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// आपकी सभी JSON फाइलें
const subscriptionData = require('./subscription.json');
const stateData = require('./state.json');
const profileData = require('./profile.json');
const detailsData = require('./details.json');
const languageData = require('./languages.json');
const impressionData = require('./impression.json');
const cwData = require('./cw.json');
const experimentsData = require('./experiments.json');
const idsData = require('./ids.json');

// 1. Subscription API (Mod Data)
app.post('/analytics/v1/impression', (req, res) => {
    res.json(impressionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    res.json(stateData);
});

// 3. Profile API
app.get('/feedservice/v1/shows/5?page=0&size=10', (req, res) => {
    res.json(list5);
});

// 4. Details API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    res.json(subscriptionData);
});

// 5. Languages API
app.get('/userservice/v1/languages', (req, res) => {
    res.json(languageData);
});

// 6. List APIs (जैसे 10446, 10636, 10638 आदि)
app.get('/userservice/v1/profile', (req, res) => {
    res.json(profileData);
});

app.post('/userservice/v1/device/ids', (req, res) => {
    res.json(idsData);
});

app.get('/userservice/v1/experiments', (req, res) => {
    res.json(experimentsData);
});

app.get('/feedservice/v1/show/cw', (req, res) => {
    res.json(cwData);
});

app.get('/feedservice/v1/category/details', (req, res) => {
    res.json(detailsData);
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
