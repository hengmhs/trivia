import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

class LoginForm extends React.Component {
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
    const password = e.target[1].value;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        this.props.setDisplayName(userCredential.user.displayName);
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
        <h3>Sign In</h3>
        <form onSubmit={this.handleAuthSubmit}>
          <div>Email: </div>
          <input type="email"></input>
          <div>Password: </div>
          <input type="password"></input>
          <div>
            <input type="submit" value="Login"></input>
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForm;
