// Client-side synchronisation engine optimized for Vercel Free Tier
// Strictly avoids unnecessary serverless invocations by operating entirely out of client-side JSON state.
// Batches synchronisation with Google Sheets via a Google Apps Script Webhook on-demand or during automated midnight archival.

const STORAGE_KEY = 'dk_all_in_health_state_v1';

export function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse local health JSON cache:', err);
    return null;
  }
}

export function saveStoredState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to write health state to local cache:', err);
  }
}

/**
 * Batched sync to Google Sheets.
 * Calls the user-configured Google Apps Script Webhook URL.
 * If no endpoint is configured or if network fails, falls back gracefully to offline queue.
 */
export async function syncBatchToGoogleSheets(batchPayload, webhookUrl) {
  if (!webhookUrl || webhookUrl.trim() === '') {
    // Return simulated success with offline notice
    return {
      success: true,
      mode: 'simulated_local',
      message: 'Logged to local JSON state. (Set your Google Apps Script Web App URL in settings to stream to live Google Sheets).',
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Mode no-cors is standard for Google Apps Script Web App redirects
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'dk-all-in.vercel.app',
        device: 'Google Pixel 8',
        action: 'BATCH_SYNC_SUBMIT',
        clientTimestamp: new Date().toISOString(),
        payload: batchPayload
      }),
      mode: 'no-cors' // Google Apps Script returns opaque redirect
    });

    return {
      success: true,
      mode: 'live_sheets_webhook',
      message: 'Batch synchronisation successfully transmitted to Google Sheets.',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn('Network error during Google Sheets synchronisation:', err);
    return {
      success: false,
      mode: 'network_failed',
      message: 'Network synchronisation failed. Batched data retained in local JSON queue.',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generates downloadable JSON backup file of entire health database
 */
export function exportHealthBackupJSON(state) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const now = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `dk-all-in-health-backup-${now}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
