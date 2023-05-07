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

  // const memberSince = user.metadata.creationTime.slice(5, 16);
  // const lastOnline = moment(user.metadata.lastSignInTime).fromNow();

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
    <div className="App">
      <Link to="/home" className="navbar-ctn">
        <button className="back-btn">Back to Home</button>
      </Link>
      <br />
      <div className="profile-ctn">
        <h1>User Profile</h1>
        <br />
        <form onSubmit={handleUpdatePhoto} className="update-ctn">
          <img className="avatar-profile" alt="User avatar" src={photoURL} />
          <br />
          <input
            className="update-input"
            type="file"
            name="profilePhoto"
            alt="User profile photo"
            onChange={(e) => setPhoto(e.target.files[0])}
            src={photoURL}
          />
          <input
            type="submit"
            value="Update Profile Photo"
            className="update-btn"
          />
        </form>
        <p>{String(user?.email).split("@")[0]}</p>
        <p>{user?.email}</p>
        {response && <p>{response}</p>}
        <p>Member since {memberSince}</p>
        <p>Last online {lastOnline}</p>

        <br />
        <h2>Update user details</h2>
        <form onSubmit={handleUpdateEmail} className="update-ctn">
          <input
            className="update-input"
            type="email"
            placeholder="Enter new email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input type="submit" value="Update email" className="update-btn" />
          <br />
        </form>
        <form onSubmit={handleUpdatePassword} className="update-ctn">
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
          <input type="submit" value="Update password" className="update-btn" />
          <br />
        </form>
      </div>
    </div>
  );
}

export default Profile;
