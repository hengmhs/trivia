// Register form
// Users can register with email and password
// Additional input fields for username and confirm password
// On successful registration, users are taken to Main page
// Link to Login page for existing users

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref as databaseRef, set } from "firebase/database";
import { updateProfile } from "firebase/auth";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";

function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | Quantum Quiz";
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  });

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setDisplayName(user.displayName);
  //     } else {
  //       console.log("No one is logged in");
  //       // User is signed out
  //     }
  //   });
  // }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      const credentials = await register(email, password, displayName);
      const newUser = credentials.user;
      const newUserRef = databaseRef(database, "users/" + newUser.uid);
      await set(newUserRef, {
        email: email,
        photoURL:
          "https://firebasestorage.googleapis.com/v0/b/trivia-7c009.appspot.com/o/images%2Fdefault-user-icon-13.jpg?alt=media&token=d7026bf6-d791-425a-a389-cc14babb21c9",
        regDate: newUser.metadata.creationTime,
        lastOnline: newUser.metadata.lastSignInTime,
        username: displayName,
      });
      await updateProfile(newUser, {
        displayName: displayName,
        photoURL:
          "https://firebasestorage.googleapis.com/v0/b/trivia-7c009.appspot.com/o/images%2Fdefault-user-icon-13.jpg?alt=media&token=d7026bf6-d791-425a-a389-cc14babb21c9",
      })
        .then((res) => {
          navigate("/home");
        })
        .catch((err) => {
          setError(err.toString());
        });
    }
  };

  return (
    <div className="background">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="App auth-ctn">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-header-text">Join Us, Explorer!</h1>
          </div>
          <div className="login-card-content">
            <form onSubmit={handleRegister} className="register-form">
              <TextField
                label="Username"
                className="auth-input"
                type="text"
                placeholder="Username"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <TextField
                className="auth-input"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                className="auth-input"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <TextField
                className="auth-input"
                type="password"
                label="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                value="Register Now"
                className="register-btn"
                variant="contained"
              >
                Register
              </Button>
            </form>
            {error && <p className="error-msg">Error: {error}</p>}
            <div className="login-text">
              Already have an account?{" "}
              <span>
                <a className="auth-link" href="/login">
                  Login
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
