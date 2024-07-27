import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DropDownSearchBox from "../common/DropDownSearchBox";
import { searchUsers } from "../services/user";

function NavBar({ user }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  async function handleUserSearchChange({ target }) {
    if (target.value.trim() === "") return;

    try {
      const { data: queriedUsers } = await searchUsers(target.value);
      const items = [];
      for (let i = 0; i < queriedUsers.length; i++) {
        items.push({
          text: queriedUsers[i].username,
          to: `/profile/${queriedUsers[i]._id}`,
        });
      }
      setItems(items);
    } catch (error) {
      console.log("Failed to load Users:", error);
    }
  }

  return (
    <header className="p-3 bg-white sticky-top shadow-sm">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <Link className="mb-0 me-3" to="/">
            HS
          </Link>
          <DropDownSearchBox
            onChange={handleUserSearchChange}
            className="me-3"
            items={items}
            placeholder={"Search Users..."}
          />
          {user._id ? (
            <div className="text-end">
              <div className="dropdown text-end">
                <a
                  className="d-block link-body-emphasis text-decoration-none dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user.avatarPath}
                    width="32"
                    height="32"
                    className="avatar rounded-circle"
                  />
                </a>
                <ul className="dropdown-menu text-small">
                  <li>
                    <Link className="dropdown-item" to={`/profile/${user._id}`}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/signout">
                      Sign out
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-end">
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="btn btn-primary me-2"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="btn btn-warning"
              >
                Sign-up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
