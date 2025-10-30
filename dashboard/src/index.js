import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import GeneralContext  from "./components/GeneralContext";

import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Orders from "./components/Orders";
import Holdings from "./components/Holdings";
import Positions from "./components/Positions";
import Funds from "./components/Funds";
import Apps from "./components/Apps";

// --- START OF CHANGE ---
// 1. Import the new component
import AuthCallback from "./components/AuthCallback";
// --- END OF CHANGE ---

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GeneralContext>
    <BrowserRouter>
      <Routes>
        {/* --- START OF CHANGE --- */}
        {/* 2. Add the new route. This route does not need the Dashboard layout. */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* --- END OF CHANGE --- */}

        {/* Your existing dashboard routes */}
        <Route path="/" element={<Dashboard />}>
          <Route path="" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/apps" element={<Apps />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </GeneralContext>
);