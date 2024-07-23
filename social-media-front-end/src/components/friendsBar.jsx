import React, { Component } from "react";
import Friend from "./friend.jsx";

class Friends extends Component {
  render() {
    return (
      <div className="card overflow-hidden">
        <div className="card-body bg-white">
          <h5 className="pb-3">People you may know</h5>
          <Friend />
          <Friend />
          <Friend />
        </div>
      </div>
    );
  }
}

export default Friends;
