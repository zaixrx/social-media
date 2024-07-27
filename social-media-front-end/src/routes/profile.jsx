import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../services/user";
import Friends from "../components/friendsBar";
import Post from "../components/post";
import EditUser from "../components/editUser";
import EditPost from "../components/editPost";

function Profile({ currentUser }) {
  const [user, setUser] = useState({});
  const [prevId, setPrevId] = useState("");
  const { _id } = useParams();

  useEffect(() => {
    if (prevId === _id) return;

    (async () => {
      try {
        const { data: user } = await getUser(_id);
        setUser(user);
      } catch (error) {
        alert(error.message);
      }
    })();

    setPrevId(_id);
  }, [_id]);

  let [asyncFunctionRefrence, setAsyncFunctionRefrence] = useState(
    () => () => {}
  );
  function getDataRefrence(_asyncFunctionRefrence) {
    setAsyncFunctionRefrence(() => _asyncFunctionRefrence);
  }

  function handlePostEdit(post) {
    if (!asyncFunctionRefrence) return;
    asyncFunctionRefrence(post).catch((err) => console.log(err.message));
  }

  const isOwner = user._id === currentUser._id;
  const usersExist = user._id && currentUser._id;

  return (
    usersExist && (
      <>
        {isOwner && (
          <>
            <EditUser user={user} />
            <EditPost getDataRefrence={getDataRefrence} user={user} />
          </>
        )}
        <div className="container my-3 p-0">
          <div className="row">
            <div className="col-lg-7 px-0">
              <div className="card bg-white overflow-hidden">
                <div className="card-header border-0 bg-white p-0">
                  <div className="card-img">
                    <div
                      style={{ height: "125px" }}
                      className="wallpaper-gradient w-100"
                    ></div>
                  </div>
                </div>
                <div className="card-body d-flex align-items-start gap-4 pt-3 pb-4 px-4">
                  <img
                    src={user.avatarPath}
                    height={100}
                    width={100}
                    style={{ marginTop: -40 }}
                    className="rounded-circle avatar border border-white border-2"
                  />
                  <div>
                    <h4 className="mb-1">{`${user.firstName} ${user.lastName}`}</h4>
                    <div className="d-flex">
                      <span className="fw-bold">@{user.username}</span>
                      <p className="mb-0 dot">School Principal</p>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="d-flex mt-3 ms-sm-auto">
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#editUserModal"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="vstack gap-3 mt-3">
                {user.posts.map((post) => {
                  return (
                    <Post
                      onPostEdit={handlePostEdit}
                      currentUser={currentUser}
                      user={user}
                      post={post}
                      key={post._id}
                    />
                  );
                })}
              </div>
            </div>
            <div className="col-lg-5 px-lg-4">
              <Friends />
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default Profile;
