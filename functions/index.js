const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { google } = require('googleapis')

// Must match the exact property URL registered in Google Search Console
const SITE_URL = 'https://www.ortstrategy.com/'

// Load service account — from file locally, from env var in CI/CD
let serviceAccount
try {
  serviceAccount = require('./serviceAccount.json')
} catch {
  try {
    serviceAccount = JSON.parse(process.env.GSC_SERVICE_ACCOUNT)
  } catch {
    serviceAccount = null
  }
}

exports.getSearchInsights = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to the admin panel')
  }
  if (!serviceAccount) {
    throw new HttpsError('failed-precondition', 'Service account not configured')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const sc = google.searchconsole({ version: 'v1', auth })

  // Last 90 days
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 90)
  const fmt = d => d.toISOString().slice(0, 10)

  try {
    const { data } = await sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ['page'],
        rowLimit: 500,
        dataState: 'all',
      },
    })

    const result = {}
    for (const row of (data.rows || [])) {
      const url = row.keys[0]
      result[url] = {
        clicks: Math.round(row.clicks || 0),
        impressions: Math.round(row.impressions || 0),
        ctr: +((row.ctr || 0) * 100).toFixed(1),
        position: +((row.position || 0).toFixed(1)),
      }
    }
    return { rows: result, period: `${fmt(start)} → ${fmt(end)}` }
  } catch (e) {
    console.error('GSC API error:', e.message)
    throw new HttpsError('internal', `GSC API error: ${e.message}`)
  }
})
