// apiConfig.js — single place that CLI controllers read the server base URL from.
// GITV_API_URL lets users point the CLI at staging or production without touching
// source code.  Defaults to 127.0.0.1 (not localhost) to avoid IPv6 stall on Node 18+.

// Returns the base URL all CLI controllers use when talking to the GitVerse API.
// Reading from env here means no .env file is required in the project folder —
// the user can set it in their shell profile or accept the default.
export function getApiUrl() {
  return process.env.GITV_API_URL || "http://127.0.0.1:3000";
}
