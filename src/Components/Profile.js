import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ref as databaseRef, update } from "firebase/database";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { storage, database } from "../firebase";
import { updateProfile } from "firebase/auth";
import moment from "moment";

function Profile() {
  const { user, updateUserEmail, updateUserPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [lastOnline, setLastOnline] = useState("");
  const [response, setResponse] = useState();
  const [photo, setPhoto] = useState();
  const [photoURL, setPhotoURL] = useState(user.photoURL);

  const getUserMetadata = async () => {
    if (user) {
      const userMetadata = user.metadata;
      const memberSince = userMetadata.creationTime;
      const lastOnline = userMetadata.lastSignInTime;
      await setMemberSince(memberSince.slice(8, 16));
      await setLastOnline(moment(lastOnline).fromNow());
    }
  };

  useEffect(() => {
    if (user) {
      getUserMetadata();
    }
  }, [user]);

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    setResponse();

    const photoRef = storageRef(storage, `images/${photo.name}`);
    await uploadBytesResumable(photoRef, photo).then(() => {
      getDownloadURL(photoRef)
        .then((url) => {
          setPhotoURL(url);
          updateDatabasePhoto(url);
          updateUserProfilePicture(url);
        })
        .then((response) => {
          setResponse("Profile photo updated successfully!");
        })
        .catch((err) => {
          setResponse(err.message);
        });
    });
  };

  const updateUserProfilePicture = async (url) => {
    await updateProfile(user, {
      photoURL: url,
    });
  };

  const updateDatabasePhoto = async (url) => {
    const currentUserRef = databaseRef(database, "users/" + user.uid);

    await update(currentUserRef, {
      photoURL: url,
    });
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setResponse();

    await updateUserEmail(email)
      .then(() => {
        console.log(email);
        console.log("Email updated: ", user);
        updateDatabaseEmail();
      })
      .then((response) => {
        setResponse("Email updated successfully");
      })
      .catch((err) => {
        setResponse(err.message);
      });
  };

  const updateDatabaseEmail = async () => {
    const currentUserRef = databaseRef(database, "users/" + user.uid);

    await update(currentUserRef, {
      email: user.email,
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setResponse();

    if (password !== confirmPassword) {
      setResponse("Passwords do not match");
    } else {
      await updateUserPassword(password)
        .then((response) => {
          setResponse("Password updated successfully");
        })
        .catch((err) => {
          setResponse(err.message);
        });
    }
  };

  return (
    <div className="App page-ctn">
      <div className="profile-ctn">
        <div className="nav-ctn">
          <Link to="/home" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
      <h2 className="profile-header">YOUR PROFILE</h2>

      <div className="main-ctn">
        <div className="left-main-ctn">
          <div className="user-info-ctn">
            <img alt="User avatar" src={photoURL} className="avatar-profile" />
            <Link to="/photopicker">
              <button className="nav-btn">CHOOSE AVATAR</button>
            </Link>
            <div className="user-details">
              <span className="username-text details-text">
                {user?.displayName}
              </span>
              <span className="details-text">{user?.email}</span>
              <span className="details-text">Member since {memberSince}</span>
              <span className="details-text">Last online {lastOnline}</span>
            </div>
            {response && <p>{response}</p>}
          </div>
        </div>
        <div className="right-main-ctn">
          <div className="update-profile-ctn">
            <h2 className="update-profile-header">Update Profile</h2>
            <form onSubmit={handleUpdatePhoto} className="update-photo-ctn">
              <input
                className="file-input"
                type="file"
                name="profilePhoto"
                alt="User profile photo"
                onChange={(e) => setPhoto(e.target.files[0])}
                src={photoURL}
              />
              <input
                type="submit"
                value="UPDATE PROFILE PHOTO"
                className="submit-btn"
              />
            </form>
            <form onSubmit={handleUpdateEmail} className="update-email-ctn">
              <input
                className="update-input"
                type="email"
                placeholder="Enter new email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="submit"
                value="UPDATE EMAIL"
                className="update-email-btn"
              />
            </form>
            <form
              onSubmit={handleUpdatePassword}
              className="update-password-ctn"
            >
              <input
                className="update-input"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="update-input"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <input
                type="submit"
                value="UPDATE PASSWORD"
                className="update-password-btn"
              />
              <br />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
