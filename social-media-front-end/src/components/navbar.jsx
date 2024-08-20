import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DropDownSearchBox from "../common/DropDownSearchBox";
import { searchUsers } from "../services/user";
import DropDownList from "../common/DropDownList";

function NavBar({ user }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  async function handleUserSearchChange({ target }) {
    if (target.value.trim() === "") return;

    try {
      const { data: queriedUsers } = await searchUsers(target.value);
      const items = [];
      queriedUsers.forEach((_user) => {
        if (_user._id === user._id) return;

        items.push({
          text: _user.username,
          avatarPath: _user.avatarPath,
          to: `/profile/${_user._id}`,
        });
      });
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
          {user._id && (
            <DropDownSearchBox
              onChange={handleUserSearchChange}
              className="me-3"
              placeholder="Search Users..."
            >
              {items.map((item, index) => (
                <li key={index}>
                  <Link
                    className="dropdown-item align-items-center d-flex gap-2"
                    to={item.to}
                  >
                    <img
                      src={item.avatarPath}
                      height={35}
                      width={35}
                      className="avatar rounded-circle"
                    />
                    {item.text}
                  </Link>
                </li>
              ))}
            </DropDownSearchBox>
          )}
          {user._id ? (
            <div className="text-end">
              <DropDownList
                expanderID="profileListCard"
                expanderBody={
                  <img
                    src={user.avatarPath}
                    width="32"
                    height="32"
                    className="avatar rounded-circle"
                  />
                }
                className="d-block link-body-emphasis text-decoration-none dropdown-toggle"
              >
                <li>
                  <Link className="dropdown-item" to={`/profile/${user._id}`}>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/signout">
                    Sign out
                  </Link>
                </li>
              </DropDownList>
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
