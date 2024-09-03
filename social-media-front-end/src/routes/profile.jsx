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
import Paragpragh from "../common/Paragraph";
import { showMessage } from "../utils/logging";

let usersModal = null;
function Profile({ currentUser, setIsLoading }) {
  const [prevId, setPrevId] = useState("");
  const [targetUser, setTargetUser] = useState({});
  const [usersList, setUsersList] = useState([]);

  const { _id } = useParams();
  const navigate = useNavigate();
  const isOwner = targetUser._id === currentUser._id;
  const usersExist = targetUser._id && currentUser._id;

  useEffect(() => {
    setIsLoading(true);
    if (prevId === _id) return;
    setPrevId(_id);

    (async () => {
      try {
        const { data: user } = await getUser(_id);
        setTargetUser(user);
        setIsLoading(false);
      } catch ({ message, response }) {
        console.error(
          `Could not fetch user ${_id}:`,
          response ? response : message
        );
      }
    })();
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

  const [followLoading, setFollowLoading] = useState(false);

  async function handleFollow() {
    if (followLoading) return;

    const _targetUser = { ...targetUser };
    try {
      setFollowLoading(true);
      await sendFollowUserRequest(_id);
      _targetUser.followers.push(currentUser._id);
      currentUser.following.push(_id);
      setTargetUser(_targetUser);
      setFollowLoading(false);
    } catch ({ response, message }) {
      showMessage(response ? response.data : message);
    }
  }

  async function handleUnfollow() {
    if (followLoading) return;

    const _targetUser = { ...targetUser };
    try {
      setFollowLoading(true);
      await sendUnfollowUserRequest(_id);
      _.pull(_targetUser.followers, currentUser._id);
      _.pull(currentUser.following, _id);
      setTargetUser(_targetUser);
      setFollowLoading(false);
    } catch (error) {
      showMessage(response ? response.data : message);
    }
  }

  async function showUsersList(usersID) {
    let users = [];
    for (let i = 0; i < usersID.length; i++) {
      const userID = usersID[i];
      const { data: user } = await getUser(userID);
      users.push(user);
    }
    setUsersList(users);
    usersModal = new Modal("#usersListModal");
    usersModal.show();
  }

  return (
    usersExist && (
      <>
        {isOwner && (
          <>
            <EditUser user={targetUser} />
            <EditPost getDataReference={getDataReference} user={targetUser} />
          </>
        )}
        <PopUp modalId="usersListModal" headerLabel="Users" showFooter={false}>
          <div className="d-flex flex-column gap-2">
            {usersList.map((targetUser) => (
              <div
                key={targetUser._id}
                className="d-flex justify-content-between"
              >
                <Link
                  onClick={() => {
                    usersModal.hide();
                  }}
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
                    <Paragpragh className="my-1">{targetUser.bio}</Paragpragh>
                    <div className="d-flex fs-6 text-secondary clickable">
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
                              await handleUnfollow();
                            }}
                          >
                            {followLoading ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              "Unfollow"
                            )}
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-primary"
                            onClick={async () => {
                              await handleFollow();
                            }}
                          >
                            {followLoading ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              "Follow"
                            )}
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
                targetUser.posts.reverse().map((post) => {
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
