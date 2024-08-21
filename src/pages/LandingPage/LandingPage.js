import CloseIcon from "@mui/icons-material/Close";
import { Avatar } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Html5QrcodePlugin from "./Html5QrcodePlugin";
import styles from "./landing.module.css";

// vars + dependency
const rootPath = process.env.PUBLIC_URL;
const logoPath = `${rootPath}/spahoot_logo.gif`;
const rp = "http://localhost:8000";

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

export function PlayerAvatar() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  const profileApi = `${rp}/api/profiles/profile.php`;

  const defaultAvatarUrl = "https://via.placeholder.com/150";

  useEffect(() => {
    const authToken = Cookies.get("auth");
    if (authToken) {
      fetch(profileApi, {
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, []);

  const handleAvatarClick = () => {
    if (username) {
      navigate(`/profile/${username}`);
    } else {
      navigate("/login-reg");
    }
  };

  return (
    <IconButton className={styles["styledButton"]} onClick={handleAvatarClick}>
      <Avatar
        alt="Player Icon"
        className={styles["player-avatar"]}
        // src={defaultAvatarUrl}
      />
    </IconButton>
  );
}

function MyModal({ open, handleClose, items, handleJoin }) {
  // Style for the modal box
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Current players:
        </Typography>
        <Box sx={{ mt: 2 }}>
          {items.map((item, index) => (
            <Typography key={index} sx={{ mt: 1 }}>
              {item}
            </Typography>
          ))}
        </Box>
        <Button onClick={handleJoin} fullWidth sx={{ mt: 2 }}>
          Join
        </Button>
      </Box>
    </Modal>
  );
}

function LandingPage() {
  //username state
  const navigate = useNavigate(); // Hook to get the navigate function

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pin, setPIN] = useState(null);
  const [qrOpen, setQrOpen] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = useState([]);
  const handleOpen = async () => {
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleJoin = () => {
    navigate(`/lobby?pin=${pin}`, {
      state: { username: user, gameData: { pin: pin } },
    });
  };

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("App [result]", decodedResult);
    setPIN(decodedText);
    setQrOpen(false);
  };

  const lobbies = async () => {
    const apiUrl = `${rp}/api/lobby/lobby.php`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data[pin]) {
        const updatedPlayers = data[pin].map((player) => player.username);
        return updatedPlayers;
        // The updated players will be logged in the next render
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function validPin() {
    return await fetch(`${rp}/api/lobby/pin.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      body: JSON.stringify({ pin: pin }),
    })
      .then((res) => res.json())
      .then((data) => {
        return data.result;
      });
  }

  const redir = (url) => {
    if (loggedIn === false) {
      setError("You need to be logged in to create a game!");
      return;
    }
    // pass username prop to next component (lobby component)
    navigate(rootPath + url, { state: { username: user, lobbyPIN: pin } });
  };

  // make sure username is always set.
  const usernameSet = (event) => {
    const val = event.target.value;
    setUser(val);
    Cookies.set("username", user);
  };

  const joinGame = async () => {
    if (!pin || user.trim() === "") {
      setError("Set a pin / valid username first!");
      return;
    } else {
      // Using navigate to programmatically route & pass state/query
      const valid = await validPin();
      if (valid === true) {
        const data = {
          action: "LOBBY_GET",
          player: { username: null },
          lobbyId: pin,
        };
        const lobbyPlayers = await fetcher(`/api/lobby/lobby.php`, data);
        if (lobbyPlayers && lobbyPlayers["players"].length > 0) {
          setItems(lobbyPlayers["players"]);
          handleOpen();
        } else {
          setError("Empty lobby!");
          return;
        }
      } else {
        setError("Lobby doesn't exist!");
        return;
      }
    }
  };
  const login = () => {
    if (!loggedIn) {
      navigate("/login-reg");
    } else {
      // go to userprofile
      navigate(`/profile/${user}`, { state: { username: user } });
    }
  };

  const logOut = () => {
    Cookies.remove("auth");
    setLoggedIn(false);
    setUser("");
    Cookies.remove("username");
  };

  const pinChange = (event) => {
    Cookies.set("pin", event.target.value);
    // redundant?
    setPIN(event.target.value);
  };

  // COMPONENTS
  const PlayerAvatar = () => {
    return (
      <>
        <IconButton className={styles["styledButton"]} onClick={login}>
          <Avatar
            alt="Player Icon"
            className={styles["player-avatar"]}
            // src="https://cdn.pixabay.com/photo/2020/04/30/03/26/hummingbird-5111260_1280.jpg"
          />
        </IconButton>
      </>
    );
  };

  const CreateGameButton = () => {
    return (
      <Button
        variant="outlined"
        className={styles["create-game-button"]}
        onClick={() => {
          redir("/game-creation");
        }}
        sx={{
          fontWeight: "bold",
          fontFamily:
            "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
          color: "white",
          margin: "1%",
          "border-radius": "20px",
          "font-size": "300%",
          width: "100%",
          height: "80%",
          "&:hover": {
            color: "black",
          },
        }}
      >
        Create a game
      </Button>
    );
  };

  const JoinGameButton = () => {
    return (
      <Button
        variant="outlined"
        className={styles["join-button"]}
        onClick={() => {
          joinGame();
        }}
        sx={{
          fontWeight: "bold",
          fontFamily:
            "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
          color: "white",
          margin: "1%",
          "border-radius": "20px",
          "font-size": "30px",
          width: "80%",
          height: "10%",
          "&:hover": {
            color: "black",
          },
        }}
      >
        JOIN
      </Button>
    );
  };

  const LogoutButton = () => {
    return (
      <Button
        variant="outlined"
        disabled={!loggedIn}
        onClick={() => {
          logOut();
        }}
      >
        Log out!
      </Button>
    );
  };

  // displays name based on box or logged in user
  useEffect(() => {
    const tk = Cookies.get("auth");
    if (!tk) {
      return;
    }

    // Define the async function inside the useEffect
    const fetchData = async (tk) => {
      try {
        const res = await fetch(`${rp}/api/profiles/auth.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          body: JSON.stringify({ token: tk }),
        });
        const data = await res.json();
        if (data) {
          setLoggedIn(true); // Assuming setUser is defined elsewhere
          setUser(data);
          Cookies.set("username", data);

          // document.querySelector("#user-input-id").remove();
          // const username_cont = document.querySelector("h2");
          // username_cont.innerText += " " + data + "!";
        } else {
          return;
        }
      } catch (err) {
        console.error("Error!", err);
      }
    };

    // Call the async function
    fetchData(tk);
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    if (error) {
      document.querySelector("#error-msg-id").innerText = error;
      // console.log(error);
      // setTimeout(2000);
      // document.querySelector("#error-msg-id").innerText = "";
    }
  }, [error]);

  return (
    <main className={styles["main-parent"]}>
      <section className={styles["top-container"]}>
        <div className={styles["logo"]}>
          <img className={styles["logo-img"]} src={logoPath}></img>
        </div>
        <div>
          <MyModal
            open={open}
            handleClose={handleClose}
            items={items}
            handleJoin={handleJoin}
          />
        </div>
        <div className={styles["username-container"]} id="username-container">
          <h2 className={styles["username-display"]}>{`I am`}</h2>
          <input
            placeholder="username!"
            id="user-input-id"
            className={styles["user-input"]}
            onChange={usernameSet}
            disabled={loggedIn}
            value={user}
          ></input>
        </div>
        <div className={styles["profile-avatar"]}>
          <LogoutButton />
          <PlayerAvatar />
        </div>
      </section>

      <section className={styles["main-container"]}>
        <div className={styles["create-game-container"]}>
          <CreateGameButton />
        </div>
        <div className={styles["join-container"]}>
          <p style={{ color: "white" }} id="error-msg-id"></p>

          <div className={styles["join-prompt"]}>
            <h3>Join a game!</h3>
          </div>
          <input
            id="join-input-id"
            className={styles["join-pin-input"]}
            placeholder="PIN"
            max="4"
            onChange={pinChange}
            value={pin}
          ></input>
          <br></br>
          <JoinGameButton />
          {qrOpen && (
            <div style={{ width: "50%", marginLeft: "25%" }}>
              <Typography variant="h7">
                Or join a game by scanning a QR code:
              </Typography>
              <Html5QrcodePlugin
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
              />
            </div>
          )}
          <p
            style={{
              color: "white",
            }}
            id="error-msg-id"
          ></p>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
