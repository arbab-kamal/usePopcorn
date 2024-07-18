/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import App from './App-v2';
import StarRating from './starRating';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={5}
      message={["terrible", "bad", "okay", "Good", "Amazing"]}
      defaultRating={3}
    /> */}
  </React.StrictMode>
);


