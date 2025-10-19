import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, get, push, remove, update, onValue } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyB69TaaLy8uAe_B9Qohj8kJgILA8by5jRU",
  authDomain: "stc-signal-soft.firebaseapp.com",
  databaseURL: "https://stc-signal-soft-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stc-signal-soft",
  storageBucket: "stc-signal-soft.firebasestorage.app",
  messagingSenderId: "710195739487",
  appId: "1:710195739487:web:2301c03b0689ac534ed4ea",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export { database, ref, set, get, push, remove, update, onValue }
