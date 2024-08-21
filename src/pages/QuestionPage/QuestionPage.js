import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import "./QuestionPage.css";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import { useLocation, useNavigate } from "react-router-dom";

const rp = "http://localhost:8000";

const QuestionPage = () => {
  const [questionData, setQuestionData] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const l = useLocation();

  // modal for telling user if they got the question correct or incorrect
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const style = {
    textAlign: "center",
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

  const navigate = useNavigate();

  const handleAnswerSelected = (buttonId) => {
    setSelectedAnswer(buttonId);
    console.log(buttonId);
  };

  // get game info and question data
  useEffect(() => {
    const fetchGameInfoAndQuestion = async () => {
      try {
        // Fetch game-info
        const pin = Cookies.get("pin");
        if (!pin) {
          return;
        }

        const responseGameId = await fetch(
          `${rp}/api/get-user-game-id.php?pin=${pin}`,
        );
        if (!responseGameId.ok)
          throw new Error("Network response was not ok for game id.");

        let gameId = (await responseGameId.json()).ID;
        console.log(`GAME ID: ${gameId}`);

        const responseGameInfo = await fetch(
          `${rp}/api/game-info/get-game-info.php?id=${gameId}`,
        );
        if (!responseGameInfo.ok)
          throw new Error("Network response was not ok for game info.");

        const gameInfoData = await responseGameInfo.json();
        gameInfoData.current_question = parseInt(gameInfoData.current_question);
        gameInfoData.total_questions = parseInt(gameInfoData.total_questions);
        setGameInfo(gameInfoData);

        const username = getCookie("username");
        const auth_token = getCookie("auth");

        if (gameInfoData.current_question == 1) {
          console.log("THIS RAN WITH: ", gameId);
          const responseQuestion = await fetch(
            `${rp}/api/question/add-or-reset-score.php?id=${gameId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: username,
                auth_token: auth_token,
              }),
            },
          );
        }

        if (gameInfoData.current_question) {
          const responseQuestion = await fetch(
            `${rp}/api/question/get-question-data.php?game_id=${gameId}`,
          );
          if (!responseQuestion.ok)
            throw new Error("Network response was not ok for question.");

          const questionData = await responseQuestion.json();
          console.log(`Question data: ${questionData}`);
          setQuestionData(questionData[gameInfoData.current_question - 1]);
        } else {
          console.error("Current question is null or undefined.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGameInfoAndQuestion();
  }, []);

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  // when timer reaches 0, selectedAnswer is sent to server, current_question is updated, and we route to leaderboard page
  useEffect(() => {
    if (timeRemaining === 0) {
      console.log(`Time's up! You selected answer #${selectedAnswer}`);
      console.log(document.cookie);

      const username = getCookie("username");
      const auth_token = getCookie("auth");
      const pin = Cookies.get("pin");
      if (!pin) {
        return;
      }

      // Submit user's answer to the server  alright so it's:
      const submitAnswer = async () => {
        const responseGameId = await fetch(
          `${rp}/api/get-user-game-id.php?pin=${pin}`,
        );
        if (!responseGameId.ok)
          throw new Error("Network response was not ok for game id.");

        let gameId = (await responseGameId.json()).ID;

        console.log("CURRENT: ", gameInfo.current_question);
        return fetch(
          `${rp}/api/question/submit-and-check-answer.php?id=${gameInfo.current_question}&game_id=${gameId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              answer: selectedAnswer,
              username: username,
              auth_token: auth_token,
            }),
          },
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Failed to submit answer");
          })
          .then((data) => {
            setIsAnswerCorrect(data.isCorrect);
            setCorrectAnswer(data.correctAnswer);
            return data;
          });
      };

      submitAnswer()
        .then(async () => {
          const responseGameId = await fetch(
            `${rp}/api/get-user-game-id.php?pin=${pin}`,
          );
          if (!responseGameId.ok)
            throw new Error("Network response was not ok for game id.");

          let gameId = (await responseGameId.json()).ID;
          // After successfully submitting the answer, updata current_question
          return fetch(
            `${rp}/api/game-info/update-current-question.php?id=${gameId}`,
          );
        })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Network response was not ok.");
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      handleOpen();

      // navigate to leaderboard page after 2 seconds
      setTimeout(() => {
        navigate("/leaderboard");
      }, 4000);

      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    // Cleanup function to clear the timer
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      marginTop={3}
    >
      <div>
        {isAnswerCorrect !== null && (
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              {isAnswerCorrect ? (
                <Typography
                  sx={{ color: "#1db954" }}
                  variant="h5"
                  component="h2"
                >
                  Correct!
                </Typography>
              ) : (
                <div className="red-border">
                  <Typography sx={{ color: "red" }} variant="h5" component="h2">
                    Incorrect<br></br>
                  </Typography>
                  <Typography>
                    {`Correct answer: ${questionData[`answer_${correctAnswer}`]}`}
                  </Typography>
                </div>
              )}
            </Box>
          </Modal>
        )}
      </div>

      <Chip
        label={`Question ${gameInfo ? gameInfo.current_question : ""} of ${gameInfo ? gameInfo.total_questions : ""}`}
      ></Chip>

      <div className="question-timer">{timeRemaining}</div>

      {/* <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6">
          An audio element will be displayed here to play a preview of the song
          with the below ID:
        </Typography>
        <Typography variant="h6">
          {questionData
            ? `Spotify Song ID: ${questionData.spotify_song_id}`
            : ""}
        </Typography>
        <Typography variant="h6">
          {questionData ? `Song Title: ${questionData.song_title}` : ""}
        </Typography>
        <Typography variant="h6">
          {questionData ? `Song Artist: ${questionData.song_artist}` : ""}
        </Typography>
      </Paper> */}

      {questionData && (
        <audio
          controls="controls"
          autoPlay="true"
          src={questionData.preview_url}
          type="audio/mpeg"
        ></audio>
      )}

      <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6">
          {questionData
            ? questionData.question_type === "artist"
              ? "Who is the artist of the song?"
              : "What is the title of the song?"
            : ""}
        </Typography>
      </Paper>

      <Grid marginTop={1} container spacing={1}>
        <Grid item xs={12} sm={6}>
          <button
            onClick={() => handleAnswerSelected(1)}
            className={`${selectedAnswer === 1 ? "selected-answer blue-background " : ""}answer-button blue-border`}
          >
            <Typography variant="h6">
              {questionData ? questionData.answer_1 : ""}
            </Typography>
          </button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <button
            onClick={() => handleAnswerSelected(2)}
            className={`${selectedAnswer === 2 ? "selected-answer red-background " : ""}answer-button red-border `}
          >
            <Typography variant="h6">
              {questionData ? questionData.answer_2 : ""}
            </Typography>
          </button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <button
            onClick={() => handleAnswerSelected(3)}
            className={`${selectedAnswer === 3 ? "selected-answer green-background " : ""}answer-button green-border `}
          >
            <Typography variant="h6">
              {questionData ? questionData.answer_3 : ""}
            </Typography>
          </button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <button
            onClick={() => handleAnswerSelected(4)}
            className={`${selectedAnswer === 4 ? "selected-answer purple-background " : ""}answer-button purple-border `}
          >
            <Typography variant="h6">
              {questionData ? questionData.answer_4 : ""}
            </Typography>
          </button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionPage;
