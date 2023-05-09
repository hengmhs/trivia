import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import QuantumLogo from "../images/QuantumLogo.png";
import Button from "@mui/material/Button";

function Navbar() {
  const { user, logout } = useAuth();

  function ActiveUser() {
    if (user) {
      return (
        <div>
          <Link to={`/profile/${user.uid}`}>
            <button className="avatar-btn">
              <img
                className="avatar-nav"
                src={user.photoURL}
                alt="User avatar"
              />{" "}
            </button>
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="navbar-ctn">
      <div className="navbar-left">
        <img src={QuantumLogo} alt="Quantum Quiz Logo" className="nav-logo" />
        <p>
          Welcome, <b>{user.displayName}</b>
        </p>
      </div>

      <div className="navbar-right">
        <ActiveUser />
        <div className="navbar-user-btn">
          {" "}
          <Link to={"/users"}>
            <Button variant="outlined">USERS</Button>
          </Link>
        </div>
        <Link to={"/login"}>
          <Button variant="outlined" onClick={() => logout()}>
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
