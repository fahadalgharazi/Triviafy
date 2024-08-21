import React, { useEffect, useState } from "react";
import "./GameCreation.css";
import { Box, Button, Typography } from "@mui/material";
import Container from "@mui/material/Accordion";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import Grid from "@mui/material/Grid";
import "@fontsource/roboto/700.css";
import {
  ContactlessOutlined,
  Cookie,
  NavigateBefore,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import cryptoRandomString from "crypto-random-string";
import Cookies from "js-cookie";
import shuffle from "lodash.shuffle";
import { count, generate } from "random-words";
import { Link, useLocation, useNavigate } from "react-router-dom";

const GameCreationPage = () => {
  const [Game, setGame] = useState({});
  const [selectedDone, setSelectedDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [userFetched, setUserFetched] = useState(false);
  const [playlistId, setPlaylistId] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchUsername = async () => {
      const authCookie = Cookies.get("auth");
      if (!authCookie) {
        console.error("Auth cookie not found");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/api/profiles/profile.php",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authCookie}`,
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        if (data.username) {
          console.log("as");
          setUsername(data.username);
          setUserFetched(true);
        } else {
          console.error("No user found with the provided auth token");
        }
      } catch (error) {
        console.error("Failed to fetch username:", error);
      }
    };

    if (!userFetched) {
      fetchUsername();
    }
  }, [userFetched]);

  const fetchPlaylists = async () => {
    const response = await fetch(
      `http://localhost:8000/api/gameSettings/playlists.php?username=${encodeURIComponent(username)}`,
    );
    const data = await response.json();
    if (data.error) {
      console.error("Failed to fetch playlists:", data.error);
    } else {
      setPlaylists(data.items);
      handleOpen();
    }
    console.log(playlists);
  };
  const gameSolo = () => {
    setGame({
      ...Game,
      ["gameMode"]: "Solo",
    });
    console.log("Solo");
  };
  const teams = () => {
    setGame({
      ...Game,
      ["gameMode"]: "Team",
    });
    console.log("teams");
  };
  const fiveRounds = () => {
    setGame({
      ...Game,
      ["rounds"]: 5,
    });
    console.log("rounds5");
  };
  const tenRounds = () => {
    setGame({
      ...Game,
      ["rounds"]: 10,
    });
    console.log("rounds10");
  };
  const fifRounds = () => {
    setGame({
      ...Game,
      ["rounds"]: 15,
    });
    console.log("rounds15");
  };
  const gameNormal = () => {
    setGame({
      ...Game,
      ["Time"]: "Normal",
    });
    console.log("normal");
  };
  const Rapid = () => {
    setGame({
      ...Game,
      ["Time"]: "Rapid-Fire",
    });
    console.log("Rapid-Fire");
  };

  const Done = () => {
    if (
      "Time" in Game &&
      "rounds" in Game &&
      "gameMode" in Game &&
      "songs" in Game
    ) {
      setSelectedDone(true);
      const randomSongs = shuffle(Game["songs"].slice(0, Game["rounds"]));
      console.log("random songs:", randomSongs);
      setGame({
        ...Game,
        ["songs"]: randomSongs,
        ["pin"]: generate({ minLength: 5, maxLength: 5 }),
      });
    } else {
      alert(
        "if you've clicked all of the game options, wait while we get your spotify songs and try clicking done ",
      );
    }
  };
  const fetchTracks = async (playlistId) => {
    try {
      console.log(username);
      const response = await fetch(
        `http://localhost:8000/api/gameSettings/tracks.php?username=${encodeURIComponent(username)}&playlist_id=${playlistId}`,
      );
      const data = await response.json();
      console.log(data);
      if (data.error) {
        console.error("Failed to fetch tracks:", data.error);
      } else {
        // Handle tracks data, e.g., store it in state
        console.log(data);
        //set spotify song state
        Game["songs"] = data;
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    const lobbyPIN = Game["pin"];
    Cookies.set("pin", lobbyPIN);
    Game["host"] = location.state.username;
    if (selectedDone == true) {
      console.log(Game);
      // Send the JSON string to PHP using fetch
      fetch(`http://localhost:8000/api/gameSettings/index.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Game),
      })
        .then((response) => response.text()) // Assuming the response is text
        .then((data) => console.log(data)) // Log the response from PHP
        .catch((error) => console.error("Error:", error));
      navigate(`/lobby?pin=${lobbyPIN}`, {
        state: {
          username: location.state.username,
          gameData: Game,
        },
      });
    }
  }, [selectedDone]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        marginTop={5}
      >
        <Typography
          align="center"
          variant="h3"
          component="h2"
          marginBottom={"80px"}
        >
          Game Creation Settings
        </Typography>
      </Box>

      <Grid
        container
        direction={"row"}
        height={"100vh"}
        alignContent={"flex-start"}
      >
        <Grid item xs={"4"}>
          <Stack spacing={2} xs={12} marginRight={"10px"}>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"Solo"}
              onClick={gameSolo}
              className={"gameBtn"}
            ></Chip>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"Teams"}
              onClick={teams}
              className={"gameBtn"}
            ></Chip>
          </Stack>
        </Grid>
        <Grid item xs={"4"}>
          <Stack spacing={2} marginRight={"10px"}>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"5 Rounds"}
              onClick={fiveRounds}
              className={"gameBtn"}
            ></Chip>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"10 Rounds"}
              onClick={tenRounds}
              className={"gameBtn"}
            ></Chip>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"15 Rounds"}
              onClick={fifRounds}
              className={"gameBtn"}
            ></Chip>
          </Stack>
        </Grid>
        <Grid item xs={"4"}>
          <Stack spacing={2}>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"Normal"}
              onClick={gameNormal}
              className={"gameBtn"}
            ></Chip>
            <Chip
              sx={{ backgroundColor: "black", color: "white", height: "60px" }}
              label={"Rapid Fire"}
              onClick={Rapid}
              className={"gameBtn"}
            ></Chip>
          </Stack>
        </Grid>
        {/* <Box width="100%" display="flex" sx={{ marginTop: "70px" }}>
          <Chip
            sx={{
              backgroundColor: "green",
              color: "white",
              width: "150px",
              height: "60px",
              marginRight: "15px",
            }}
            label={"Spotify"}
            // onClick={() => {
            //   const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
            //   const CLIENT_ID = "b819c8bc4b504da8a1b0f26fd745f408";
            //   const REDIRECT_URI = encodeURIComponent(
            //     "http://localhost:3000/game-creation",
            //   );
            //   const RESPONSE_TYPE = "token";
            //   const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
            //   setGame({
            //     ...Game,
            //     ["spotify"]: true,
            //   });
            //   window.open(url, "Spotify Login", "width=500,height=600");
            // }}
          ></Chip>
        </Box> */}
        <Button variant="outlined" color="primary" onClick={fetchPlaylists}>
          Load Spotify Playlists
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Choose a Playlist</DialogTitle>
          <List>
            {playlists.map((playlist) => (
              <ListItem
                button
                key={playlist.id}
                onClick={() => {
                  console.log("Selected playlist ID:", playlist.id);
                  fetchTracks(playlist.id); // Fetch tracks when a playlist is selected
                  handleClose();
                }}
              >
                <ListItemText primary={playlist.name} />
              </ListItem>
            ))}
          </List>
        </Dialog>
        <Box
          width="100%"
          display="flex"
          justifyContent="flex-end"
          sx={{ marginTop: "70px" }}
        >
          <Chip
            sx={{
              backgroundColor: "black",
              color: "white",
              width: "100px",
              height: "60px",
              marginRight: "15px",
            }}
            label={"Back"}
            onClick={() => navigate("/")}
          ></Chip>
          <Chip
            sx={{
              backgroundColor: "black",
              color: "white",
              width: "100px",
              height: "60px",
            }}
            label={"Done"}
            onClick={Done}
          ></Chip>
        </Box>
      </Grid>
    </>
  );
};

export default GameCreationPage;
