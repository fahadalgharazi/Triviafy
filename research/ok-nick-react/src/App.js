import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442t/nmsalvem_react_example/backend/api.php",
        );
        const jsonData = await response.json();
        setData(jsonData.payload);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">{data ? data : "Loading..."}</header>
    </div>
  );
}

export default App;
