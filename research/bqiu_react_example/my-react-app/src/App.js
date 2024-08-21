import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [display, setDisplay] = useState("");

  useEffect(async () => {
    const msg = await fetch(
      "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442t/bqiu_react_example/public/api/api.php"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json(); // parse the JSON from the response
      })
      .then((data) => {
        console.log(data); // this will log the response from your PHP API
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      });

    console.log(msg);
    setDisplay(msg);
  }, []); // empty dependency array, run only once.

  return (
    <div className="App">
      <h1>This is a sample react app, served by PHP.</h1>
      <h2>{display.message}</h2>
    </div>
  );
}

export default App;
