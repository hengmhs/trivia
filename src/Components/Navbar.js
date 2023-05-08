import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import QuantumLogo from "../images/QuantumLogo.png";
import Button from "@mui/material/Button";

function Navbar() {
  const { user, logout } = useAuth();

  function ActiveUser() {
    if (user) {
      console.log(user);
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
        <Link to={"/users"}>
          <button className="nav-btn">ALL USERS</button>
        </Link>
        <ActiveUser />
        <Link to={"/login"}>
          <Button className="logout-btn" onClick={() => logout()}>
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
