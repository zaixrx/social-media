import React, { Component } from "react";

class ProfileBar extends Component {
  render() {
    const { user } = this.props;

    return (
      <div className="card pb-3">
        <img className="border-0 wallpaper wallpaper-gradient" />
        <div className="card-body py-0">
          <img
            src={user.avatarPath}
            height={50}
            width={50}
            style={{ marginTop: -20 }}
            className="avatar rounded-circle mb-1"
          />
          <h5>@{user.username}</h5>
          <p>I'm a Software Developer</p>
        </div>
      </div>
    );
  }
}

export default ProfileBar;
