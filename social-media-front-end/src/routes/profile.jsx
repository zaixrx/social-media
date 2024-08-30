import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getUser,
  sendFollowUserRequest,
  sendUnfollowUserRequest,
} from "../services/user";
import Friends from "../components/friendsBar";
import Post from "../components/post";
import EditUser from "../components/editUser";
import EditPost from "../components/editPost";
import SharePost from "../components/sharePost";
import PopUp from "../common/PopUp";
import { Modal } from "bootstrap";

function Profile({ currentUser }) {
  const [prevId, setPrevId] = useState("");
  const [targetUser, setTargetUser] = useState({});
  const { _id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (prevId === _id) return;
    (async () => {
      try {
        const { data: user } = await getUser(_id);
        setTargetUser(user);
      } catch ({ message, response }) {
        console.error(
          `Could not fetch user ${_id}:`,
          response ? response : message
        );
      }
    })();

    setPrevId(_id);
  }, [_id]);

  let [asyncFunctionRefrence, setAsyncFunctionReference] = useState(
    () => () => {}
  );
  function getDataReference(_asyncFunctionRefrence) {
    setAsyncFunctionReference(() => _asyncFunctionRefrence);
  }

  function handlePostEdit(post) {
    if (!asyncFunctionRefrence) return;
    asyncFunctionRefrence(post).catch((err) => console.log(err.message));
  }

  async function handleFollow(targetUser) {
    if (!targetUser) return;
    const { _id, followers } = targetUser;
    try {
      await sendFollowUserRequest(_id);
      followers.push(currentUser._id);
      currentUser.following.push(_id);
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
    }
    return targetUser;
  }

  async function handleUnfollow(targetUser) {
    if (!targetUser) return;
    const { _id, followers } = targetUser;
    try {
      await sendUnfollowUserRequest(_id);
      _.pull(followers, currentUser._id);
      _.pull(currentUser.following, _id);
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
    }
    return targetUser;
  }

  const [usersList, setUsersList] = useState([]);

  async function showUsersList(usersID) {
    new Modal("#usersList").show();
    let users = [];
    for (let i = 0; i < usersID.length; i++) {
      const userID = usersID[i];
      const { data: user } = await getUser(userID);
      users.push(user);
    }
    setUsersList(users);
  }

  const isOwner = targetUser._id === currentUser._id;
  const usersExist = targetUser._id && currentUser._id;

  return (
    usersExist && (
      <>
        {isOwner && (
          <>
            <EditUser user={targetUser} />
            <EditPost getDataReference={getDataReference} user={targetUser} />
          </>
        )}
        <PopUp modalId="usersList" headerLabel="Users" showSubmitButton={false}>
          <div className="d-flex flex-column gap-2">
            {usersList.map((targetUser) => (
              <div
                key={targetUser._id}
                className="d-flex justify-content-between"
              >
                <Link
                  to={`/profile/${targetUser._id}`}
                  className="d-flex align-items-center gap-2 text-black"
                >
                  <img
                    src={targetUser.avatarPath}
                    className="avatar rounded-circle"
                    height={40}
                    width={40}
                  />
                  <span className="fs-5">@{targetUser.username}</span>
                </Link>
                {targetUser._id !== currentUser._id && (
                  <button
                    id={targetUser._id}
                    className="btn btn-outline-primary"
                    onClick={async () => {
                      if (currentUser.following.includes(targetUser._id)) {
                        await sendUnfollowUserRequest(targetUser._id);
                        document.getElementById(targetUser._id).innerHTML =
                          "Follow";
                      } else {
                        await sendFollowUserRequest(targetUser._id);
                        document.getElementById(targetUser._id).innerHTML =
                          "Unfollow";
                      }
                    }}
                  >
                    {currentUser.following.includes(targetUser._id)
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </PopUp>
        <div className="container my-3">
          <div className="row g-4">
            <div className="col-lg-8 vstack gap-3">
              <div className="card bg-white overflow-hidden">
                <div className="card-header border-0 bg-white p-0">
                  <div className="card-img">
                    <div
                      style={{ height: "125px" }}
                      className="wallpaper-gradient w-100"
                    />
                  </div>
                </div>
                <div className="card-body px-4 align-items-start">
                  <div
                    type="button"
                    data-bs-toggle={isOwner && "modal"}
                    data-bs-target={isOwner && "#editUserModal"}
                  >
                    <img
                      src={targetUser.avatarPath}
                      height={125}
                      width={125}
                      style={{ marginTop: -65 }}
                      className="rounded-circle avatar border border-white border-2"
                    />
                  </div>
                  <div className="my-3">
                    <h3 className="m-0">{`${targetUser.firstName} ${targetUser.lastName}`}</h3>
                    <div className="d-flex fs-5 my-1">
                      <span className="fw-bold">@{targetUser.username}</span>
                      <p className="mb-0 dot">{targetUser.role}</p>
                    </div>
                    <span className="my-1">{targetUser.bio}</span>
                    <div className="d-flex fs-6 text-secondary">
                      <span onClick={() => showUsersList(targetUser.followers)}>
                        Followers: {targetUser.followers.length}
                      </span>
                      <span
                        onClick={() => showUsersList(targetUser.following)}
                        className="dot"
                      >
                        Following: {targetUser.following.length}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {isOwner ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#editUserModal"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => navigate(`/chat/${targetUser._id}`)}
                        >
                          Message
                        </button>
                        {targetUser.followers.includes(currentUser._id) ? (
                          <button
                            className="btn btn-outline-primary"
                            onClick={async () => {
                              const user = await handleUnfollow({
                                ...targetUser,
                              });
                              setTargetUser(user);
                            }}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-primary"
                            onClick={async () => {
                              const user = await handleFollow({
                                ...targetUser,
                              });
                              setTargetUser(user);
                            }}
                          >
                            Follow
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {isOwner && <SharePost user={targetUser} />}
              {targetUser.posts.length === 0 ? (
                <div className="card px-4 py-4">
                  <span className="fs-3">
                    {targetUser.firstName} Has No Posts &#128554;
                  </span>
                </div>
              ) : (
                targetUser.posts.map((post) => {
                  return (
                    <Post
                      onPostEdit={handlePostEdit}
                      currentUser={currentUser}
                      user={targetUser}
                      post={post}
                      key={post._id}
                    />
                  );
                })
              )}
            </div>
            <div className="col-lg-4">
              <Friends
                followers={currentUser.followers}
                following={currentUser.following}
              />
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default Profile;
