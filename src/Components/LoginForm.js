// Login form
// Existing users can log in using email and password
// On successful login, users are taken to Main page
// Link to Register page for new users

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Trivia Game";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError();

    await login(email, password)
      .then((res) => {
        navigate("/main");
      })
      .catch((err) => {
        setError(err.toString());
      });
  };

  return (
    <div className="App auth-ctn">
      <div className="auth">
        <h1>Login</h1>
        {error && <p className="error-msg">Error: {error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <input type="submit" value="LOGIN" className="login-btn" />
        </form>
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
  );
}

export default LoginForm;
