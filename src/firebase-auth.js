import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Lazy-initialised: firebase/app must already have called initializeApp()
// which happens via firebase.js, imported by Admin.jsx before this module runs.
export const auth = getAuth(getApp())
