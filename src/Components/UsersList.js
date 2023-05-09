import React, { useState, useEffect } from "react";
import { ref as databaseRef, onValue, off } from "firebase/database";
import { database } from "../firebase";
import { Link } from "react-router-dom";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [usersRef, setUsersRef] = useState(null);

  useEffect(() => {
    document.title = "Users | Quantum Quiz";
  }, []);

  useEffect(() => {
    const usersRef = databaseRef(database, "users");
    setUsersRef(usersRef);
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const usersList = Object.entries(usersData).map(([id, userData]) => ({
        id,
        ...userData,
      }));
      setUsers(usersList);
    });
    return () => {
      if (usersRef) {
        off(usersRef);
      }
    };
  }, []);

  return (
    <div className="App page-ctn">
      <div className="users-ctn">
        <div className="nav-ctn">
          <Link to="/home" className="back-link">
            ← Back to Home
          </Link>
          <h2 className="users-header">USERS</h2>
        </div>
        <div className="users-list-ctn">
          {users.map((user) => (
            <li key={user.id} className="users-list">
              <img
                src={user.photoURL}
                alt="User avatar"
                className="users-avatar"
              />
              <div className="users-info">
                <div>{user.username}</div>
                <div>{user.status}</div>
                <Link to={`/users/${user.id}`}>
                  <button className="nav-btn">View Profile</button>
                </Link>
              </div>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsersList;
