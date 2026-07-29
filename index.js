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
const list223 = require('./223.json');
const list5 = require('./5.json');
const impressionData = require('./impression.json');
const cwData = require('./cw.json');
const experimentsData = require('./experiments.json');
const structData = require('./struct.json');
const list505 = require('./505.json');
const idsData = require('./ids.json');
const list507 = require('./507.json');
const list512 = require('./512.json');
const list509 = require('./509.json');
const list755 = require('./755.json');
const list514 = require('./514.json');
const list515 = require('./515.json');
const list516 = require('./516.json');
const list519 = require('./519.json');
const list521 = require('./521.json');
const list522 = require('./522.json');

// 1. Subscription API (Mod Data)
app.post('/analytics/v1/impression', (req, res) => {
    res.json(impressionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    res.json(stateData);
});

// 3. Profile API
app.get('/feedservice/v1/shows/5', (req, res) => {
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

app.get('/feedservice/v1/shows/223', (req, res) => {
    res.json(list223);
});

app.get('/v1/shows/505', (req, res) => {
    res.json(list505);
});

app.get('/feedservice/v1/shows/507', (req, res) => {
    res.json(list507);
});

app.post('/userservice/v1/device/ids', (req, res) => {
    res.json(idsData);
});

app.get('/feedservice/v1/homepage/struct', (req, res) => {
    res.json(structData);
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

app.get('/feedservice/v1/shows/512', (req, res) => {
    res.json(list512);
});

app.get('/feedservice/v1/shows/509', (req, res) => {
    res.json(list509);
});

app.get('/feedservice/v1/shows/755', (req, res) => {
    res.json(list755);
});

app.get('/feedservice/v1/shows/514', (req, res) => {
    res.json(list514);
});

app.get('/feedservice/v1/shows/515', (req, res) => {
    res.json(list515);
});

app.get('/feedservice/v1/shows/516', (req, res) => {
    res.json(list516);
});

app.get('/feedservice/v1/shows/519', (req, res) => {
    res.json(list519);
});

app.get('/feedservice/v1/shows/521', (req, res) => {
    res.json(list521);
});

app.get('/feedservice/v1/shows/522', (req, res) => {
    res.json(list522);
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
