import React, { useState, useEffect } from "react";
import Post from "../components/post.jsx";
import ProfileBar from "../components/profileBar.jsx";
import Friends from "../components/friendsBar.jsx";
import SharePost from "../components/sharePost.jsx";
import { getPosts } from "../services/posts.js";
import EditPost from "../components/editPost.jsx";
import { showMessage } from "../utils/logging.js";

function Home({ user, setIsLoading }) {
  const [posts, setPosts] = useState([]);

  /*
   * 74 - جامعة العلوم والتكنولوجيا هواري. بومدين(الجزائر)
   * 87 - المدرسة الوطنية العليا للإعلام الآلي بالجزائر(الجزائر)
   * 88 - المدرسة العليا للإعلام الآلي سيدي بلعباس
   * 89 - المدرسة العليا في علوم وتكنولوجيات الإعلام الآلي والرقمنة بجاية
   * 90 -  المدرسة الوطنية العليا للذكاء الاصطناعي الجزائر
   * 93 - المدرسة الوطنية العليا للأمن السيبراني الجزائر
   */

  // Father: 109680887052050008
  // Mother: 119690675045530005
  // Me-1: 120541893
  // Me-2: 100060675124730007

  useEffect(() => {
    setIsLoading(true);
    try {
      getPosts().then(({ data: _posts }) => {
        setPosts(_posts);
        setIsLoading(false);
      });
    } catch ({ response, message }) {
      showMessage(response ? response.data : message);
    }
  }, []);

  // Frick react
  let [asyncFunctionReference, setAsyncFunctionReference] = useState(
    () => () => {}
  );
  function getDataReference(_asyncFunctionRefrence) {
    setAsyncFunctionReference(() => _asyncFunctionRefrence);
  }

  function handlePostEdit(post) {
    if (!asyncFunctionReference) return;
    asyncFunctionReference(post).catch((error) =>
      showMessage(
        `Internal Application Error: ${error.message}\nPlease report this bug to my discord account <bold>zaizr</bold>`
      )
    );
  }

  return (
    <>
      <EditPost
        user={user}
        getDataReference={getDataReference}
        onPostEdit={() => window.location.reload()}
        setIsLoading={setIsLoading}
      />
      <div className="container my-3">
        <div className="row g-4">
          <div className="col-lg-3 section">
            <ProfileBar user={user} />
          </div>
          <div className="col-md-8 col-lg-6 vstack gap-4">
            <SharePost
              user={user}
              onNewPost={() => {
                window.location.reload();
              }}
              setIsLoading={setIsLoading}
            />
            {posts.map((post) => {
              return (
                <Post
                  key={post._id}
                  currentUser={user}
                  user={post.user}
                  post={post}
                  onPostEdit={handlePostEdit}
                />
              );
            })}
          </div>
          <div className="col-lg-3 section">
            <Friends
              user={user}
              followers={user.followers}
              following={user.following}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
