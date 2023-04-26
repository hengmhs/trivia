import React from "react";

const NameForm = (props) => {
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    const displayName = e.target[0].value;
    console.log(displayName);
    props.setDisplayName(displayName);
  };
  return (
    <div className="authform" onSubmit={handleAuthSubmit}>
      <h3>Sign In</h3>
      <form>
        <div>Name: </div>
        <input type="text"></input>
        <input type="submit" value="Submit"></input>
      </form>
    </div>
  );
};

export default NameForm;
