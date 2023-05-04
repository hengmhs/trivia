// First page users see
// Navigate to Login/Register page via buttons

import React from "react";
import { Link } from "react-router-dom";

function Enter() {
  return (
    <div>
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="App auth-ctn">
        <div className="auth">
          <div>Logo goes here</div>
          <h1>Trivia Game</h1>
          <div className="enter-btns">
            <Link to="/login">
              <button className="auth-btn">LOGIN</button>
            </Link>
            <Link to="/register">
              <button className="auth-btn">REGISTER</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enter;
