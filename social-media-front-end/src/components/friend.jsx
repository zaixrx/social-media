import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../services/user.js";

function Friend({ user: userID }) {
  const [user, setUser] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUser(userID);
        setUser(data);
      } catch {}
    })();
  }, []);

  return (
    <Link
      to={`/profile/${userID}`}
      className="d-flex text-black flex-row align-items-center"
    >
      <img
        src={user.avatarPath}
        height={50}
        width={50}
        className="avatar rounded-circle me-3"
      />
      <div>
        <h6 className="mb-0">
          {user.firstName} {user.lastName}
        </h6>
        <p className="text">{user.role}</p>
      </div>
    </Link>
  );
}

export default Friend;
