import axios from "axios";
import { sleep } from "../utils/test.js";

const apiEndpoint = `${process.env.REACT_APP_API_URL}/posts/`;

export async function getPosts() {
  return await axios.get(apiEndpoint);
}

export async function publishPost(data, token) {
  await axios.post(apiEndpoint, data, {
    headers: {
      "x-auth-token": token,
    },
  });
}

export async function editPost(_id, data, token) {
  return await axios.put(apiEndpoint + _id, data, {
    headers: {
      "x-auth-token": token,
      "x-type": "post",
    },
  });
}

export async function sendPostDeleteRequest(_id, token) {
  return await axios.delete(apiEndpoint + _id, {
    headers: {
      "x-auth-token": token,
      "x-type": "post",
    },
  });
}

export async function sendPostLikeRequest(like, _id, token) {
  return await axios.put(
    apiEndpoint + _id,
    { like },
    { headers: { "x-auth-token": token, "x-type": "post-like" } }
  );
}

export async function sendPostCommentRequest(
  comment,
  commentParent,
  _id,
  token
) {
  return await axios.put(
    apiEndpoint + _id,
    // I put "parent" beacause of mongoose comment schema is named "parent"
    { comment, parent: commentParent },
    { headers: { "x-auth-token": token, "x-type": "comment-post" } }
  );
}

export async function sendCommentEditRequest(comment, _id, _postId, token) {
  return await axios.put(
    apiEndpoint + _postId,
    { comment },
    {
      headers: {
        "x-auth-token": token,
        "x-type": "comment-put",
        "x-comment-id": _id,
      },
    }
  );
}

export async function sendCommentDeleteRequest(_id, _postId, token) {
  return await axios.delete(apiEndpoint + _postId, {
    headers: {
      "x-auth-token": token,
      "x-comment-id": _id,
      "x-type": "comment",
    },
  });
}

export async function getPostImage(path) {
  if (!path) return;

  const response = await axios.get(path, { responseType: "blob" });
  return new File([response.data], path.slice(8, path.length), {
    type: "image/png",
  });
}
