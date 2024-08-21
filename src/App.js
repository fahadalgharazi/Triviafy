import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GameCreationPage from "./pages/game-creation/GameCreationPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import Layout from "./pages/Layout";
import LeaderboardPage from "./pages/LeaderboardPage";
import LobbyPage from "./pages/LobbyPage/LobbyPage";
import LoginReg from "./pages/loginReg/login-reg";
import QuestionPage from "./pages/QuestionPage/QuestionPage";
import "./App.css";
import React from "react";
import SpotifyURI from "./pages/loginReg/connect-spotify";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="game-creation" element={<GameCreationPage />} />
          <Route path="question" element={<QuestionPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="lobby" element={<LobbyPage />} />
          <Route path="login-reg" element={<LoginReg />} />
          <Route path="spotifyURI" element={<SpotifyURI />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="login-reg" element={<LoginReg />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
