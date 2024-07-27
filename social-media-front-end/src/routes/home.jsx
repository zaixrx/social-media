import React, { useState, useEffect } from "react";
import Post from "../components/post.jsx";
import ProfileBar from "../components/profileBar.jsx";
import Friends from "../components/friendsBar.jsx";
import SharePost from "../components/sharePost.jsx";
import { getPosts } from "../services/posts.js";
import EditPost from "../components/editPost.jsx";

function Home({ user }) {
  const [posts, setPosts] = useState([]);

  /*
   * 74 - جامعة العلوم والتكنولوجيا هواري. بومدين(الجزائر)
   * 87 - المدرسة الوطنية العليا للإعلام الآلي بالجزائر(الجزائر)
   * 88 - المدرسة العليا للإعلام الآلي سيدي بلعباس
   * 89 - المدرسة العليا في علوم وتكنولوجيات الإعلام الآلي والرقمنة بجاية
   * 90 -  المدرسة الوطنية العليا للذكاء الاصطناعي الجزائر
   * 93 - المدرسة الوطنية العليا للأمن السيبراني الجزائر
   *
   */

  // Father: 109680887052050008
  // Mother: 119690675045530005
  // Me-1: 120541893
  // Me-2: 100060675124730007

  useEffect(() => {
    (async () => {
      try {
        const { data: _posts } = await getPosts();
        setPosts(_posts);
      } catch (error) {
        if (error.response) console.log(error.response.data);
        alert(error.message);
      }
    })();
  }, []);

  // Frick react
  let [asyncFunctionRefrence, setAsyncFunctionRefrence] = useState(
    () => () => {}
  );
  function getDataRefrence(_asyncFunctionRefrence) {
    setAsyncFunctionRefrence(() => _asyncFunctionRefrence);
  }

  function handlePostEdit(post) {
    if (!asyncFunctionRefrence) return;
    asyncFunctionRefrence(post).catch((error) => console.log(error.message));
  }

  return (
    <>
      <EditPost getDataRefrence={getDataRefrence} user={user} />
      <div className="container my-3">
        <div className="row g-4">
          <div className="col-lg-3 section">
            <ProfileBar user={user} />
          </div>
          <div className="col-md-8 col-lg-6 vstack gap-4">
            {user._id && <SharePost user={user} />}
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
            <Friends />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
