// First page users see
// Navigate to Login/Register page via buttons

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LoginError from "./LoginError";
import QuantumLogo from "../images/QuantumLogo.png";

function Enter() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="App auth-ctn">
        <div className="auth">
          <div>
            <img src={QuantumLogo} alt="Quantum Quiz Logo" className="logo" />
          </div>
          <h1>Quantum Quiz</h1>
          {!user ? <LoginError /> : null}
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
