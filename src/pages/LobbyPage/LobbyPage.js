import { Avatar } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useLocation, useNavigate } from "react-router-dom";
import { escape } from "../loginReg/login-reg";
import james from "./IMG_7380.png";
import styles from "./lobby.module.css";

const rootPath = "http://localhost:8000";
const rp = "http://localhost:8000";

export function AvatarDisplay() {
  return (
    <>
      <Avatar
        className={styles["avatar-icon"]}
        alt="Player Icon"
        // src="https://cdn.pixabay.com/photo/2020/04/30/03/26/hummingbird-5111260_1280.jpg"
        // src={james}
      />
    </>
  );
}

const ButtonUsage = ({ host, sendGameData }) => {
  return (
    <Button
      onClick={sendGameData}
      variant="contained"
      className={styles["start-button"]}
      // onClick={()=>{
      //       redir("/question")
      //     }
      //     }
      disabled={!host}
      sx={{
        fontWeight: "bold",
        fontFamily:
          '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
        margin: "1%",
        "border-radius": "20px",
        "font-size": "30px",
        backgroundColor: "#71FFA1",
        width: "70%",
        height: "40%",
        color: "white",
        "&:hover": {
          backgroundColor: "#25FF6F", // Darker shade for hover state
          color: "black",
        },
      }}
    >
      START!
    </Button>
  );
};

function LobbyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state.username;
  const gameData = location.state.gameData;
  const pin = gameData["pin"];
  const [players, setPlayers] = useState([]);
  const [lobbyData, setLobbyData] = useState(null);
  const [isHost, setHost] = useState(false);
  const [status, setStatus] = useState(null);
  const [hostName, setHostName] = useState("...");

  // start of code for qr code modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "white",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  async function fetcher(url, body) {
    const api = `${rp}${url}`;
    return await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  }
  // end of code for qr code modal
  const resetGameandReroute = () => {
    // Resets the games current_question to 0.
    fetch(`${rootPath}/api/game-info/reset-current-question.php?id=${1}`)
      .then((response) => {
        if (response.ok) {
          ("");
          return response.json();
        }
        throw new Error("Network response was not ok.");
      })
      .then((data) => {
        console.log("Data successfully obtained\n");
        console.log(data);
      })
      .catch((error) => {
        console.error("Error resetting current_question", error);
      });

    navigate("/question", { state: { username: username } });
  };

  async function hostCheck(lobbyData) {
    if (Cookies.get("auth")) {
      await fetch(`${rp}/api/profiles/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: Cookies.get("auth") }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data === lobbyData["host"]) {
            setHost(true);
          }
        });
    }
  }

  async function getLobbies() {
    const apiUrl = `${rp}/api/lobby/lobby.php`;
    try {
      const playerData = {
        action: "LOBBY_GET",
        lobbyId: pin,
        player: {
          username: escape(username),
        },
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
      });
      const data = await response.json();
      if (data["status"] === "success") {
        setPlayers(data["players"]);
        // The updated players will be logged in the next render
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getLobbyData() {
    const apiUrl = `${rp}/api/lobby/lobby.php`; // Ensure `${rp}` is replaced with your actual base path

    // Here, the `pin` is used as the `lobbyId`
    const playerData = {
      lobbyId: pin,
      player: {
        username: escape(username),
      },
      action: "LOBBY_DATA",
    };

    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerData),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("Success:", data);
        setLobbyData(data);
        setStatus(data["status"]);
        setHostName(data["host"]);
      })
      .catch((error) => console.error("Error:", error));
  }

  async function addPlayerToLobby() {
    const apiUrl = `${rp}/api/lobby/lobby.php`; // Ensure `${rp}` is replaced with your actual base path

    // Here, the `pin` is used as the `lobbyId`
    const playerData = {
      lobbyId: pin,
      player: {
        username: escape(username),
      },
    };

    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerData),
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  }

  async function disconnectPlayerFromLobby() {
    const apiUrl = `${rp}/api/lobby/lobby.php`;

    const playerData = {
      action: "disconnect",
      lobbyId: pin,
      player: {
        username: escape(username),
      },
    };

    // Use Navigator.sendBeacon for sending data when unloading
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, JSON.stringify(playerData));
    } else {
      // Fallback to fetch if sendBeacon is not supported
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
      }).catch((error) => console.error("Error:", error));
    }
  }

  async function sendGameData() {
    const apiUrl = `${rp}/api/lobby/lobby.php`;

    const playerData = {
      action: "SET_LOBBY_STATUS",
      lobbyId: pin,
      player: {
        username: escape(username),
      },
      updatedStatus: "IN PROGRESS",
    };
    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerData),
    }).catch((error) => console.error("Error:", error));

    resetGameandReroute();
  }

  function Player({ playerName }) {
    return (
      <div className={styles["player"]} id={`${playerName}`}>
        <AvatarDisplay />
        <p className={styles["player-name"]}>{playerName}</p>
      </div>
    );
  }

  function PlayersContainer() {
    return (
      <div className={styles["player-container"]} id="player-container-id">
        {players.map((playerName, index) => (
          <Player key={index} playerName={playerName} />
        ))}
      </div>
    );
  }

  useEffect(() => {
    addPlayerToLobby();
    getLobbies();
    const intervalId = setInterval(() => {
      getLobbies();
      getLobbyData();
    }, 1000); // Poll every 1000 milliseconds (1 second)
    // const checkLobby = setInterval(() => {}, 2000);
    const handleBeforeUnload = (event) => {
      // perform the disconnect action here
      disconnectPlayerFromLobby();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      clearInterval(intervalId);
      // clearInterval(checkLobby);
      disconnectPlayerFromLobby();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }; // Cleanup on unmount
  }, []); // Dependencies array is empty to set the interval once on mount

  useEffect(() => {
    if (status === "IN PROGRESS") {
      resetGameandReroute();
    }
  }, [status]);

  useEffect(() => {
    if (lobbyData) {
      hostCheck(lobbyData);
    }
  }, [hostName]);

  return (
    <main className={styles["main-parent"]}>
      <section className={styles["top-bar"]}>
        <div className={styles.logo}>
          <h1>{hostName}&apos;s Lobby</h1>
        </div>
        <div className={styles["pin-container"]}>
          <h2>PIN: {pin}</h2>
          <Button
            variant="outlined"
            sx={{
              color: "#ffd700",
              borderColor: "#ffd700",
              "&:hover": {
                borderColor: "#ffd700",
              },
              marginTop: 1,
            }}
            onClick={handleOpen}
          >
            Open QR Code
          </Button>
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <Box>
                <QRCode value={pin} />
              </Box>
              <Button
                onClick={handleClose}
                fullWidth
                sx={{
                  color: "#ffd700",
                  borderColor: "#ffd700",
                  "&:hover": {
                    borderColor: "#ffd700",
                    bgcolor: "background.paper",
                  },
                  marginTop: 2,
                  bgcolor: "background.paper",
                }}
              >
                Close QR Code
              </Button>
            </Box>
          </Modal>
        </div>
      </section>
      <section className={styles["lower"]}>
        <PlayersContainer />
        <div className={styles["start-bar"]}>
          <ButtonUsage host={isHost} sendGameData={sendGameData} />
          <p className={styles["start-msg"]} id="start-msg-id"></p>
        </div>
      </section>
    </main>
  );
}

export default LobbyPage;
