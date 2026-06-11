// Import React library for building UI components
import React from 'react'
// Import ReactDOM for rendering React components to the DOM
import ReactDOM from 'react-dom/client'
// Import the main App component that contains our entire application
import App from './App.jsx'
// Import the CSS styling for the application
import './styles.css'

// Create the root React component and render the App
// This finds the HTML element with id="root" and renders our App inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode is a development tool that highlights potential problems
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
