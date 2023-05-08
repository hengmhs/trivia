import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useParams, Link } from "react-router-dom";
import { ref as databaseRef, onValue, off } from "firebase/database";
import { database } from "../firebase";
import moment from "moment";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

function User() {
  const { user } = useAuth();
  const { id } = useParams();

  const [userData, setUserData] = useState(null);

  const userRef = databaseRef(database, `users/${id}`);

  useEffect(() => {
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      console.log("User data: ", userData);
      setUserData(userData);
    });
    return () => off(userRef);
  }, [id]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App page-ctn">
      <div className="user-ctn">
        <div className="nav-ctn">
          <Link to="/users" className="back-link">
            ← Back to Users
          </Link>
          <Link to={`/home`} className="nav-link">
            <HomeOutlinedIcon fontSize="medium" />
          </Link>
        </div>
        <div className="user-info-ctn">
          <img src={userData.photoURL} alt="User avatar" id="user-avatar" />

          <div className="user-details details-text">
            <span className="username-text">{userData.username}</span>
            <span className="status-text">online {userData.status}</span>
            <span>Member since {userData.regDate.slice(8, 16)}</span>
            <span>Last seen {moment(userData.lastOnline).fromNow()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
