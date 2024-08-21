import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    username: "",
    ID: "",
    gamesPlayed: 0,
    gamesWon: 0,
  });
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();
  const rp = "http://localhost:8000";

  const rootPath =
    "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442t/";

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch(
        `${rp}/api/profilepage/index.php?username=${username}`,
      );
      if (response.ok) {
        const data = await response.json();
        setProfile({
          username: data.username,
          ID: data.ID,
          gamesPlayed: data.gameplayed,
          gamesWon: data.gamewon,
        });
      } else {
        console.error("Error fetching profile data");
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--background-color",
      darkMode ? "#000" : "#fff",
    );
    document.documentElement.style.setProperty(
      "--text-color",
      darkMode ? "#fff" : "#000",
    );
    document.documentElement.style.setProperty(
      "--border-color",
      darkMode ? "#555" : "#ccc",
    );
  }, [darkMode]);

  const handleBack = () => {
    if (location.state?.from === "leaderboard") {
      navigate("/leaderboard");
    } else {
      navigate("/");
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode ? "true" : "false");
  };

  return (
    <Box
      className={styles["outer-container"]}
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--text-color)",
      }}
    >
      <Box
        className={styles["main-container"]}
        style={{
          backgroundColor: "var(--background-color)",
          color: "var(--text-color)",
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{ position: "absolute", top: 20, right: 20 }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <Box
          className={styles["left-container"]}
          style={{
            backgroundColor: "var(--background-color)",
            color: "var(--text-color)",
          }}
        >
          <Avatar alt={profile.username} sx={{ width: 250, height: 250 }} />
          <Typography variant="h5">{profile.username}</Typography>
          <Typography style={{ color: "var(--text-color)", marginTop: "8px" }}>
            ID: {profile.ID}
          </Typography>
        </Box>
        <Box
          className={styles["right-container"]}
          style={{
            backgroundColor: "var(--background-color)",
            color: "var(--text-color)",
          }}
        >
          <Typography variant="h6">Statistic</Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Typography variant="body1" style={{ color: "var(--text-color)" }}>
              Games Played:
            </Typography>
            <Paper
              elevation={3}
              sx={{
                border: "2px solid var(--border-color-light)",
                display: "inline-block",
                padding: "90px",
                backgroundColor: "var(--background-color)",
                color: "var(--text-color)",
              }}
            >
              <Typography variant="h4">{profile.gamesPlayed}</Typography>
            </Paper>
            <Typography variant="body1" style={{ color: "var(--text-color)" }}>
              Games Won:
            </Typography>
            <Paper
              elevation={3}
              sx={{
                border: "2px solid var(--border-color-light)",
                display: "inline-block",
                padding: "90px",
                backgroundColor: "var(--background-color)",
                color: "var(--text-color)",
              }}
            >
              <Typography variant="h4">{profile.gamesWon}</Typography>
            </Paper>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={{ position: "fixed", bottom: 50, right: 50 }}
          onClick={handleBack}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePage;
