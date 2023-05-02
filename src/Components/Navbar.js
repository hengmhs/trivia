import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

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
              {String(user?.email).split("@")[0]}
            </button>
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="navbar-ctn">
      <div className="navbar-left">
        <div>App logo</div>
        <p>Trivia Game</p>
      </div>

      <div className="navbar-right">
        <ActiveUser />
        <Link to={"/login"}>
          <button className="logout-btn" onClick={() => logout()}>
            Logout
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
