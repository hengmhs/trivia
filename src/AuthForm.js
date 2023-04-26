import React from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase";

class AuthForm extends React.Component {
  constructor(props) {
    super(props);
    // Initialise empty posts array in state to keep local state in sync with Firebase
    // When Firebase changes, update local state, which will update local UI
    this.state = {};
  }

  handleAuthSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    const email = e.target[0].value;
    const displayName = e.target[1].value;
    const password = e.target[2].value;
    createUserWithEmailAndPassword(auth, email, password, displayName)
      .then((userCredential) => {
        updateProfile(userCredential.user, {
          displayName: displayName,
        });
        return displayName;
      })
      .then((displayName) => {
        this.props.setDisplayName(displayName);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  render() {
    return (
      <div className="authform">
        <h3>Register</h3>
        <form onSubmit={this.handleAuthSubmit}>
          <div>Email: </div>
          <input type="email"></input>
          <div>Display Name: </div>
          <input type="text"></input>
          <div>Password: </div>
          <input type="password"></input>
          <div>
            <input type="submit" value="Register"></input>
          </div>
        </form>
      </div>
    );
  }
}

export default AuthForm;
