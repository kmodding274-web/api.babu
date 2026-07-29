const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// आपकी सभी JSON फाइलें
const subscriptionData = require('./subscription.json');
const stateData = require('./state.json');
const profileData = require('./profile.json');
const detailsData = require('./details.json');
const languageData = require('./languagees.json');
const list10446 = require('./10446.json');
const list10636 = require('./10636.json');
const list10638 = require('./10638.json');
const cwData = require('./cw.json');
const expData = require('./experiment.json');
const structData = require('./struct.json');

// 1. Subscription API (Mod Data)
app.get('/userservice/v1/profile/subscription', (req, res) => {
    res.json(subscriptionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    res.json(stateData);
});

// 3. Profile API
app.get('/userservice/v1/profile', (req, res) => {
    res.json(profileData);
});

// 4. Details API
app.get('/userservice/v1/details', (req, res) => {
    res.json(detailsData);
});

// 5. Languages API
app.get('/userservice/v1/languages', (req, res) => {
    res.json(languageData);
});

// 6. List APIs (जैसे 10446, 10636, 10638 आदि)
app.get('/userservice/v1/list/10446', (req, res) => {
    res.json(list10446);
});

app.get('/userservice/v1/list/10636', (req, res) => {
    res.json(list10636);
});

app.get('/userservice/v1/list/10638', (req, res) => {
    res.json(list10638);
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
