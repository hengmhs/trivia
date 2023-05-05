// Login form
// Existing users can log in using email and password
// On successful login, users are taken to Main page
// Link to Register page for new users

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import NASA from "../images/NASA.jpg";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Trivia Game";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError();

    if (user) {
      navigate("/sessionerror");
    } else {
      await login(email, password)
        .then((res) => {
          navigate("/home");
        })
        .catch((err) => {
          setError(err.toString());
        });
    }
  };

  return (
    <div className="App auth-ctn">
      <div className="login-card">
        <div className="login-card-header">
          <h1 className="login-card-header-text">Welcome, Explorer!</h1>
        </div>
        <div className="login-card-content">
          {" "}
          <form onSubmit={handleLogin} className="login-form">
            <TextField
              color="primary"
              label="Email"
              variant="outlined"
              className="auth-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              className="auth-input"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" className="login-btn">
              Login
            </Button>
          </form>
          {error && <p className="error-msg">Error: {error}</p>}
          <div className="login-text">
            Don't have an account?{" "}
            <span>
              <a className="auth-link" href="/register">
                Register Now
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
