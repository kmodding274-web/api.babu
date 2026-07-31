import axios from 'axios';

// Base URL & Headers configuration extracted from HAR trace
const BASE_URL = 'https://story.appsdone.online';

const defaultHeaders = {
  'appVersion': '14',
  'platform': '0',
  'deviceId': '5de5d3c427dcb215',
  'os': 'Android 16 (API 36)',
  'network_type': 'WIFI',
  'X-AYUSH-KEY': 'LEGEND_2026_SECRET',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IlN1biBKdW4gMjggMTU6Mjk6MzQgVVRDIDIwMjYiLCJzZXNzaW9uSWQiOiIxNDMzMDU4NSIsImRldmljZUlkIjoiNWRlNWQzYzQyN2RjYjIxNSIsInN1YiI6IjEyMjcxODY5IiwiZXhwIjoxNzgyOTE5Nzc0fQ.z8f023DCzpzGg3J1t4VHloQWBtcPxi9PbxkqP_zl4PQ',
  'Content-Type': 'application/json',
  'User-Agent': 'ktor-client'
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: defaultHeaders
});

// Dynamic Request Interceptor to update timestamp on each call
api.interceptors.request.use((config) => {
  config.headers['ts'] = Math.floor(Date.now() / 1000).toString();
  return config;
});

export const apiService = {
  // User Service Endpoints
  getExperiments: () => api.get('/userservice/v1/experiments'),
  getSubscriptionState: () => api.get('/userservice/v1/profile/subscription/state'),
  getLanguages: () => api.get('/userservice/v1/languages'),
  getProfile: () => api.get('/userservice/v1/profile'),
  getSubscriptionDetails: () => api.get('/userservice/v1/profile/subscription'),
  registerDeviceId: (fcmtoken) => api.post('/userservice/v1/device/ids', { fcmtoken }),

  // Feed Service Endpoints
  getCategoryDetails: () => api.get('/feedservice/v1/category/details'),
  getContinueWatching: () => api.get('/feedservice/v1/show/cw'),
  getHomepageStruct: () => api.get('/feedservice/v1/homepage/struct'),
  getShowsBySection: (sectionId, page = 0, size = 10) => 
    api.get(`/feedservice/v1/shows/${sectionId}`, { params: { page, size } }),
  getSuggestedShows: (showId, shuffle = false) => 
    api.get('/feedservice/v1/suggested/shows', { params: { showId, shuffle } }),
  getEpisodeList: (showId) => api.get(`/feedservice/v1/episode/list/${showId}`),

  // Analytics Endpoints
  trackImpression: (impressionsData) => api.post('/analytics/v1/impression', impressionsData)
};

export default apiService;
