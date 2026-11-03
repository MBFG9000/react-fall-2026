//key to store data in localstorage
// Unique per task: every task of this repo is served from the same
// GitHub Pages origin, so they all share one localStorage.
export const DATA_KEY = "react-task-05-crew";

//configs for fake API
// fakeApi.js reads these values on every request, so the network presets
// (service.js) can change them at runtime.
export const API_CONFIG = {
  minDelay: 500,
  maxDelay: 3000,
  errorChance: 0.05,
};
