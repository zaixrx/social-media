import React from "react";
import { useNavigate } from "react-router-dom";
import Paragpragh from "../common/Paragraph";

function ProfileBar({ user }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${user._id}`)}
      className="card clickable pb-3"
    >
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
        <Paragpragh>{user.bio ? user.bio : `A ${user.role}`}</Paragpragh>
      </div>
    </div>
  );
}

export default ProfileBar;
