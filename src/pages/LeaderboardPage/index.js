import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import "./index.css";

const rootPath = "http://localhost:8000";

function orderScores(leaderboardData) {
  // map of username->{score, rounds: [{round, score}]}}

  let scores = new Map();

  for (const info of leaderboardData) {
    const round = parseInt(info.round);
    const score = parseInt(info.score);
    if (scores.has(info.username)) {
      const storedInfo = scores.get(info.username);
      storedInfo.score += score;
      storedInfo.rounds.push({ round, score });
    } else {
      scores.set(info.username, {
        score,
        rounds: [{ round, score }],
      });
    }
  }

  // array of [{username, score, rounds: [score]}]
  // where rounds is ordered by points earned for that round
  let orderedScores = [];
  for (const [username, info] of scores) {
    info.rounds.sort((a, b) => a.round - b.round);

    // If the user doesn't answer a question correctly, the server will not assign a score for
    // that round for the user. For consistency, we fill in "gaps" with a score of 0.
    // Currently, this does not account for rounds up to "current_question"
    let newRounds = [];

    let lastRound = info.rounds[0].round;
    for (const roundInfo of info.rounds) {
      // fill in rounds that weren't set with a score of 0
      for (let i = lastRound; i < roundInfo.round - 1; i++) {
        newRounds.push(0);
      }

      newRounds.push(roundInfo.score);
      lastRound = roundInfo.round;
    }

    orderedScores.push({
      username,
      score: info.score,
      rounds: newRounds,
    });
  }

  // order scores by highest to lowest
  orderedScores.sort((a, b) => b.score - a.score);

  return orderedScores;
}

function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState(null);
  useEffect(() => {
    const doFetch = async () => {
      const pin = Cookies.get("pin");
      if (!pin) {
        return;
      }

      const responseGameId = await fetch(
        `${rootPath}/api/get-user-game-id.php?pin=${pin}`,
      );
      if (!responseGameId.ok)
        throw new Error("Network response was not ok for game id.");

      let gameId = (await responseGameId.json()).ID;

      fetch(`${rootPath}/api/leaderboard/index.php?id=${gameId}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Network response was not ok.");
        })
        .then((data) => {
          setLeaderboardData(data);
        })
        .catch((error) => {
          console.error("Error fetching leaderboard data:", error);
        });
    };

    doFetch();
  }, []);

  const [questionInfo, setQuestionInfo] = useState(null);
  useEffect(() => {
    const doFetch = async () => {
      const pin = Cookies.get("pin");
      if (!pin) {
        return;
      }

      const responseGameId = await fetch(
        `${rootPath}/api/get-user-game-id.php?pin=${pin}`,
      );
      if (!responseGameId.ok)
        throw new Error("Network response was not ok for game id.");

      let gameId = (await responseGameId.json()).ID;

      fetch(`${rootPath}/api/game-info/get-game-info.php?id=${gameId}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Network response was not ok.");
        })
        .then((data) => {
          setQuestionInfo({
            current_question: parseInt(data.current_question),
            total_questions: parseInt(data.total_questions),
          });
        })
        .catch((error) => {
          console.error("Error fetching question info:", error);
        });
    };

    doFetch();
  }, []);

  const navigate = useNavigate();
  useEffect(() => {
    // if it's not the last page, then the next button won't show
    // and the leaderboard page will only display for a few seconds
    if (
      questionInfo &&
      questionInfo.current_question <= questionInfo.total_questions
    ) {
      setTimeout(() => {
        // TODO: what if the user presses the next button
        navigate("/question");
      }, 5000);
    }
  }, [questionInfo]);

  // TODO: reduce redundancy w/ above
  const isLastPage =
    questionInfo &&
    questionInfo.current_question > questionInfo.total_questions;
  const scores = leaderboardData && orderScores(leaderboardData);

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      height="100vh"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="200px"
      >
        <Box
          display="flex"
          alignItems="center"
          height="60%"
          sx={{
            backgroundColor: "secondary.main",
            padding: "5px",
            paddingLeft: "40px",
            paddingRight: "40px",
            borderRadius: "5px",
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "3rem",
            }}
          >
            Leaderboard
          </Typography>
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          maxWidth: "900px",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <AutoSizer disableWidth>
            {({ height }) => (
              <FixedSizeList
                className="no-scrollbar"
                height={height}
                width="100%"
                itemSize={70}
                itemCount={scores ? scores.length : 0}
                itemData={{
                  scores,
                  questionInfo,
                }}
              >
                {RankEntry}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Box>
      </Box>
      {isLastPage && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="150px"
          maxWidth="750px"
        >
          <Button
            variant="contained"
            sx={{
              height: "70%",
              width: "95%",
              fontWeight: "bold",
              fontSize: "2rem",
            }}
            onClick={() => {
              navigate("/");
            }}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}

// TODO: can't lose points, so make up/down arrow be based on rank improvement
function RankEntry({ index, style, data }) {
  if (data.scores === null || data.questionInfo === null) {
    return;
  }

  const { username, score, rounds } = data.scores[index];

  const currentScore = score;
  let previousScore = score;
  const pointsAwardedAtCurrentRound = rounds.at(
    data.questionInfo.current_question - 1,
  );
  if (pointsAwardedAtCurrentRound !== null) {
    previousScore -= pointsAwardedAtCurrentRound;
  }

  const borderColor = ["#D4AF37", "#C0C0C0", "#CD7F32"][index] || null;

  const navigate = useNavigate();
  return (
    <ListItem style={style} key={index}>
      <ListItemButton
        sx={{
          border: borderColor ? 1 : null,
          borderColor: borderColor,
          bgcolor: "secondary.main",
          borderRadius: 1,
          paddingRight: "0px",
          height: "65px",
        }}
        onClick={() => {
          navigate("/profile/" + username, {
            state: {
              from: "leaderboard",
            },
          });
        }}
      >
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: "bold",
            minWidth: "3rem",
            marginRight: 1,
          }}
        >
          {index + 1}
        </Typography>
        <Avatar alt="NAME" src="" sx={{ marginRight: 1 }} />
        <Typography
          sx={{
            fontSize: "1.5rem",
            flexGrow: 1,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {username}
        </Typography>
        <Typography sx={{ fontSize: "1.6rem", color: "text.secondary" }}>
          {currentScore}
        </Typography>
        {previousScore < currentScore ? (
          <ArrowDropUpRoundedIcon fontSize="large" sx={{ color: "green" }} />
        ) : (
          <ArrowDropDownRoundedIcon fontSize="large" sx={{ color: "red" }} />
        )}
      </ListItemButton>
    </ListItem>
  );
}

export default LeaderboardPage;
