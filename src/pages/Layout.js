import Container from "@mui/material/Container";
import * as React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Container maxWidth="100%" maxHeight="100%">
      {/* <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/game-creation">Game Creation Page</Link>
          </li>
          <li>
            <Link to="/question">Question Page</Link>
          </li>
          <li>
            <Link to="/leaderboard">Leaderboard Page</Link>
          </li>
          <li>
            <Link to="/lobby">Lobby Page</Link>
          </li>
        </ul>
      </nav> */}

      <Outlet />
    </Container>
  );
};

export default Layout;
