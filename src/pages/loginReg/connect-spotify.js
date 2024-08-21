import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SpotifyCallback() {
  const navigate = useNavigate();
  // const [state, setState] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    // console.log(code);
    const username = localStorage.getItem("username");
    localStorage.removeItem("username");
    if (code) {
      // Define your backend endpoint
      const backendUrl = "http://localhost:8000/api/spotify.php";

      // Prepare the request options
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, username }),
      };

      // Send the code to the backend
      fetch(backendUrl, requestOptions);
      console.log("af4w");
      navigate("/");
    }
  }, [navigate]);

  // Render a loading indicator or a blank page
  return (
    <>
      <div>Processing Spotify authorization...</div>
    </>
  );
}

export default SpotifyCallback;
