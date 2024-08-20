import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { editUser, getUser } from "../services/user";
import Friends from "../components/friendsBar";
import Post from "../components/post";
import EditUser from "../components/editUser";
import EditPost from "../components/editPost";
import SharePost from "../components/sharePost";
import { setToken } from "../utils/token";

function Profile({ currentUser }) {
  const [user, setUser] = useState({});
  const [prevId, setPrevId] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const { _id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (prevId === _id) return;

    (async () => {
      try {
        const { data: user } = await getUser(_id);
        setUser(user);
        setFollowers(user.followers);
        setFollowing(user.following);
      } catch (error) {
        alert(error.message);
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

  async function handleFollow() {
    try {
      const { data: token } = await editUser(user._id, null, "follow");
      setToken(token);
      const _followers = [...followers];
      _followers.push(currentUser._id);
      setFollowers(_followers);
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
    }
  }

  async function handleUnfollow() {
    try {
      const { data: token } = await editUser(user._id, null, "unfollow");
      setToken(token);
      const _followers = [...followers];
      const index = followers.indexOf(currentUser._id);
      _followers.splice(index, 1);
      setFollowers(_followers);
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
    }
  }

  const isOwner = user._id === currentUser._id;
  const usersExist = user._id && currentUser._id;

  return (
    usersExist && (
      <>
        {isOwner && (
          <>
            <EditUser user={user} />
            <EditPost getDataReference={getDataReference} user={user} />
          </>
        )}
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
                      src={user.avatarPath}
                      height={125}
                      width={125}
                      style={{ marginTop: -65 }}
                      className="rounded-circle avatar border border-white border-2"
                    />
                  </div>
                  <div className="my-3">
                    <h3 className="m-0">{`${user.firstName} ${user.lastName}`}</h3>
                    <div className="d-flex fs-5 my-1">
                      <span className="fw-bold">@{user.username}</span>
                      <p className="mb-0 dot">{user.role}</p>
                    </div>
                    <span className="my-1">{user.bio}</span>
                    <div className="d-flex fs-6 text-secondary">
                      <span>Followers: {followers.length}</span>
                      <span className="dot">Following: {following.length}</span>
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
                          onClick={() => navigate(`/chat/${user._id}`)}
                        >
                          Message
                        </button>
                        {followers.includes(currentUser._id) ? (
                          <button
                            className="btn btn-outline-primary"
                            onClick={handleUnfollow}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-primary"
                            onClick={handleFollow}
                          >
                            Follow
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {isOwner && <SharePost user={user} />}
              {user.posts.length === 0 ? (
                <div className="card px-4 py-4">
                  <span className="fs-3">
                    {user.firstName} Has No Posts &#128554;
                  </span>
                </div>
              ) : (
                user.posts.map((post) => {
                  return (
                    <Post
                      onPostEdit={handlePostEdit}
                      currentUser={currentUser}
                      user={user}
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
