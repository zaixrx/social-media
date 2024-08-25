import React, { useEffect, useState } from "react";
import Friend from "./friend.jsx";

function FriendsBar({ followers, following }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!followers || !following) return;

    let result = followers.filter((follower) => !following.includes(follower));

    setUsers(result);
  }, [followers, following]);

  return (
    followers &&
    following && (
      <div className="card p-3 d-flex gap-3 overflow-hidden">
        <span className="fs-5">You may know</span>
        {users.length === 0
          ? followers.length === 0
            ? "You have no followers"
            : "It looks like that you know all you're followers"
          : users.map((user) => <Friend key={user} user={user} />)}
      </div>
    )
  );
}

export default FriendsBar;
