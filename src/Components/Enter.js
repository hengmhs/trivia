// First page users see
// Navigate to Login/Register page via buttons

import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LoginError from "./LoginError";
import QuantumLogo from "../images/QuantumLogo.png";
import Button from "@mui/material/Button";

function Enter() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  });

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
              <Button variant="contained">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outlined">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enter;
