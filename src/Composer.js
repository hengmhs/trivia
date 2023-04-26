import React from "react";
import { push, ref, set } from "firebase/database";
import { database, storage } from "./firebase";
import {
  ref as storeRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "./App.css";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_POSTS_KEY = "posts";
const STORE_IMAGE_KEY = "images";

class Composer extends React.Component {
  constructor(props) {
    super(props);
    // Initialise empty posts array in state to keep local state in sync with Firebase
    // When Firebase changes, update local state, which will update local UI
    this.state = {
      inputMessage: "",
      file: null,
    };
  }

  // Note use of array fields syntax to avoid having to manually bind this method to the class
  writeData = (callback) => {
    const postListRef = ref(database, DB_POSTS_KEY);
    // push creates a key for the new post in the database
    const newPostRef = push(postListRef);
    console.log("newPostRef: ", newPostRef);
    const currentDate = new Date();
    // if there is a file upload
    if (this.state.file) {
      // make each imgID unique based on the date
      const imgID = this.state.file.name + JSON.stringify(new Date());
      const fileRef = storeRef(storage, `${STORE_IMAGE_KEY}/${imgID}`);
      uploadBytesResumable(fileRef, this.state.file).then(() => {
        getDownloadURL(fileRef).then((url) => {
          set(newPostRef, {
            text: this.state.inputMessage,
            date: currentDate.toLocaleString("en-GB").slice(0, -3),
            imgURL: url,
            imgID: imgID,
            displayName: this.props.displayName,
            likes: [true], // true is a placeholder so that firebase will accept the write
          });
          callback();
        });
      });
    } else {
      set(newPostRef, {
        text: this.state.inputMessage,
        date: currentDate.toLocaleString("en-GB").slice(0, -3),
      });
      callback();
    }
  };

  handleInputSubmit = (e) => {
    e.preventDefault();
    console.log("e: ", e);
    e.target[0].value = null;
    const finishDataWrite = new Promise((resolve) => {
      console.log("Promise created");
      this.writeData(resolve);
    });
    finishDataWrite.then(() => {
      console.log("Executing setState"); // this never runs because the promise is not set up correctly
      // reset input text form after submitting
      this.setState({
        inputMessage: "",
        file: null,
      });
    });
  };

  handleInputChange = (e) => {
    this.setState({
      inputMessage: e.target.value,
    });
  };

  handleFileChange = (e) => {
    console.log(e.target.files[0]);
    this.setState({
      file: e.target.files[0],
    });
  };

  render() {
    return (
      <form onSubmit={this.handleInputSubmit}>
        <div>
          <input
            type="file"
            onChange={this.handleFileChange}
            className="composer-file-btn"
          ></input>
        </div>
        <textarea
          className="composer-textarea"
          rows="4"
          cols="50"
          onChange={this.handleInputChange}
          value={this.state.inputMessage}
        ></textarea>
        <br />
        <div className="composer-submit-container">
          <input type="submit" value="Send"></input>
        </div>
      </form>
    );
  }
}

export default Composer;
