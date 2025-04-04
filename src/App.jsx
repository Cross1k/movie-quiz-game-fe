import React from "react";
// import Layout from "./components/Layout/Layout.jsx";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage.jsx";
import PlayerPage from "./pages/PlayerPage/PlayerPage.jsx";
import HostPage from "./pages/HostPage/HostPage.jsx";
import GamePage from "./pages/GamePage/GamePage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/player/:id/:session" element={<PlayerPage />} />
      <Route path="/host/:session" element={<HostPage />} />
      <Route path="/game/:session" element={<GamePage />} />
      {/* <Route path="/game/:session/themes" element={<NotFoundPage />} /> */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
