import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAeP1ZX5Zv7DDw3eH3UH7OjlszDMhn0Nl0",
  authDomain: "miola-ranking.firebaseapp.com",
  projectId: "miola-ranking",
  storageBucket: "miola-ranking.firebasestorage.app",
  messagingSenderId: "854284996807",
  appId: "1:854284996807:web:b3cfab75491e5a3b266ee2"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

window.storage = {
  _listeners: {},
  async get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch { return null; }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      await setDoc(doc(db, 'miola', key), { value, updatedAt: Date.now() });
      return { value };
    } catch { return null; }
  },
  subscribeToChanges(key, callback) {
    const unsub = onSnapshot(doc(db, 'miola', key), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(key, data.value);
        callback(data.value);
      }
    });
    this._listeners[key] = unsub;
    return unsub;
  }
};

window.db = db;
window.firestoreModules = { doc, setDoc, onSnapshot };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
