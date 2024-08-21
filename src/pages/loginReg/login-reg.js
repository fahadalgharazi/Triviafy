import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./login.module.css";

//vars
const rp = "http://localhost:8000";

// this page also acts as registration
export function escape(htmlStr) {
  return htmlStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function LoginRegisterComponent() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPass] = useState("");
  const [validity, setValid] = useState({
    "username-input": true,
    "password-input": true,
    "password-input2": true,
  });
  const [userError, setError1] = useState("");
  const [passError, setError2] = useState("");
  const [passError2, setError3] = useState("");

  const login = async (event) => {
    event.preventDefault();
    const user = document.querySelector("#username-input-login").value;
    const pass = document.querySelector("#password-input-login").value;

    await fetch(`${rp}/api/profiles/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      body: JSON.stringify({
        usernameLogin: user,
        passwordLogin: pass,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result === true) {
          // set token as cookie
          const tk = data.token;
          // cookie
          Cookies.set("auth", tk, { expires: 0.25 }); // expires in a quarter of a day

          const clientId = "b819c8bc4b504da8a1b0f26fd745f408";
          const redirectUri = encodeURIComponent(
            "http://localhost:3000/spotifyURI",
          );
          const scopes = encodeURIComponent(
            "user-read-private user-read-email",
          );
          const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
          localStorage.setItem("username", user);
          Cookies.set("username", user);
          window.location.href = spotifyUrl; // Redirect to Spotify's authorization page
        } else {
          alert(data.message);
          return;
        }
      })
      .catch((err) => console.log("Error:", err));
  };

  const registerButton = async (event) => {
    event.preventDefault();
    if (
      validity["username-input"] &&
      validity["password-input"] &&
      validity["password-input2"] &&
      username &&
      password
    ) {
      await fetch(`${rp}/api/profiles/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        body: JSON.stringify({
          username: escape(username),
          password: password,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          //dostuff
          if (data.status === "f") {
            alert(data.message);
            return;
          }

          document.querySelector("#username-input-login").value = username;
          document.querySelector("#password-input-login").value = password;
          await login(event);
        })
        .catch((err) => console.log(err));
    } else {
      alert("Please enter valid credentials!");
      return;
    }
  };
  const checkValid = (event) => {
    event.preventDefault();
    const target = event.target.value;
    const targetId = event.target.id;
    const currPass = document.getElementById("password-input").value;

    // Copy the current validity state
    let newValidity = { ...validity };

    switch (targetId) {
      case "username-input":
        newValidity[targetId] = target.length <= 10;
        break;
      case "password-input":
        newValidity[targetId] = target.length >= 8;
        newValidity["password-input2"] =
          target === document.getElementById("password-input2").value; // Re-check confirm password when main password changes
        break;
      case "password-input2":
        newValidity[targetId] = target === currPass;
        break;
      default:
        break;
    }

    // Update the validity state
    setValid(newValidity);
  };

  useEffect(() => {
    const u_msg_cont = document.querySelector("#username-error-msg");
    const p_msg_cont = document.querySelector("#password-error-msg");
    const p2_msg_cont = document.querySelector("#password2-error-msg");
    if (u_msg_cont && p_msg_cont && p2_msg_cont) {
      if (!validity["username-input"]) {
        setError1(
          "Please enter a valid username, less than or equal to 10 characters.",
        );
      }
      if (!validity["password-input"]) {
        setError2("Password is invalid. Please enter at least 8 characters.");
      }
      if (!validity["password-input2"]) {
        setError3("Passwords must match!");
      }
      if (validity["username-input"] === true) {
        setUsername(document.getElementById("username-input").value);
        setError1("");
      }
      if (validity["password-input"] === true) {
        setPass(document.getElementById("password-input").value);
        setError2("");
      }
      if (validity["password-input2"] === true) {
        setError3("");
      }
    }
  }, [validity]);

  return (
    <>
      <main className={styles["main-login-container"]}>
        <div className={styles["card-inner"]}>
          <section className={styles["reg-container"]}>
            <h2>Register</h2>
            <form
              className={styles["reg-form"]}
              onSubmit={registerButton}
              onChange={checkValid}
            >
              <input
                type="text"
                name="username"
                placeholder="Username"
                id="username-input"
              />
              {/* <input type="text" name="email" placeholder="Email" />
          <br></br> */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                id="password-input"
              />
              <input
                type="password"
                name="password2"
                placeholder="Re-enter password"
                id="password-input2"
              />
              <br></br>
              <input type="submit" value="Register"></input>
              <br></br>
              <p
                className={styles["username-error-msg"]}
                id="username-error-msg"
              >
                {userError}
              </p>
              <br></br>
              <p
                className={styles["password-error-msg"]}
                id="password-error-msg"
              >
                {passError}
              </p>
              <br></br>
              <p
                className={styles["password2-error-msg"]}
                id="password2-error-msg"
              >
                {passError2}
              </p>
            </form>
          </section>
          <section className={styles["login-container"]}>
            <h2>Login</h2>

            <form className={styles["login-form"]} onSubmit={login}>
              <input
                type="text"
                name="username-login"
                placeholder="Username"
                id="username-input-login"
              />
              {/* <input type="text" name="email" placeholder="Email" />
<br></br> */}
              <input
                type="password"
                name="password-login"
                placeholder="Password"
                id="password-input-login"
              />
              <br></br>
              <a href="#">Forgot your password?</a>
              <br></br>
              <input type="submit" value="Login"></input>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default LoginRegisterComponent;
