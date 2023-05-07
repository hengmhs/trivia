import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import { getDownloadURL, listAll, ref as storageRef } from "firebase/storage";
import { database, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref as databaseRef, update } from "firebase/database";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

function UserPhotoPicker() {
  const { user } = useAuth();

  const [photoURLS, setPhotoURLs] = useState([]);
  const [photoNames, setPhotoNames] = useState([]);
  const [userPhotoURL, setUserPhotoURL] = useState(user.photoURL);
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [response, setResponse] = useState("");

  const profilePhotosRef = storageRef(storage, "profilePhotos");

  useEffect(() => {
    // Get a list of all files in profilePhotos
    listAll(profilePhotosRef).then((res) => {
      const photoNames = res.items.map((item) => item.name);
      setPhotoNames(photoNames);
      console.log("Photo names: ", photoNames);

      // Loop through files and get each URL
      const urls = [];
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          urls.push(url);
          setPhotoURLs([...urls]);
          console.log("Photo URLs: ", photoURLS);
        });
      });
    });
  }, []);

  const handlePhotoChange = async (url) => {
    setResponse();
    await setSelectedPhoto(url);
    await setUserPhotoURL(url);
    await updateDatabase(url);
    await updateUserProfilePicture(url)
      .then(() => {
        setResponse("You have successfully updated your profile photo");
      })
      .catch((err) => {
        setResponse(err.message);
      });
  };

  const updateDatabase = async (url) => {
    const userRef = databaseRef(database, "users/" + user.uid);
    await update(userRef, { photoURL: url });
  };

  const updateUserProfilePicture = async (url) => {
    await updateProfile(user, {
      photoURL: url,
    });
  };

  return (
    <div className="page-ctn App">
      <div className="photo-picker-ctn">
        <div className="nav-ctn">
          <Link to={`/profile/${user.uid}`} className="nav-link">
            ← Back to Profile
          </Link>
          <Link to={`/home`} className="nav-link">
            <HomeOutlinedIcon fontSize="medium" />
          </Link>
        </div>
        <h2 className="avatar-header">PICK AN AVATAR</h2>
        <div className="avatar-selection-ctn">
          {!selectedPhoto ? (
            <img
              src={user.photoURL}
              alt="Current avatar"
              className="user-avatar"
            />
          ) : (
            <div className="avatar-ctn">
              <img
                src={selectedPhoto}
                alt="Selected avatar"
                className="user-avatar"
              />
              {response && <div>{response} 🎉</div>}
            </div>
          )}
        </div>
        <div className="avatar-selector-ctn">
          {photoNames &&
            photoNames.map((photoName, index) => (
              <button
                key={photoName}
                onClick={() => handlePhotoChange(photoURLS[index])}
                className={`avatar-select ${
                  selectedPhoto === photoURLS[index] ? "selected" : ""
                }`}
              >
                <img
                  src={photoURLS[index]}
                  alt={photoName}
                  className="alien-avatars"
                />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default UserPhotoPicker;
