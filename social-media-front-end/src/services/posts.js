import axios from "axios";

const apiEndpoint = `http://${window.location.hostname}:3000/api/posts/`;

export function getPosts() {
  return axios.get(apiEndpoint);
}

export function publishPost(data, token) {
  return axios.post(apiEndpoint, data, {
    headers: {
      "x-auth-token": token,
      "Content-Type": undefined,
    },
  });
}

export function editPost(_id, data, token) {
  return axios.put(apiEndpoint + _id, data, {
    headers: {
      "x-auth-token": token,
    },
  });
}

export function deletePost(_id, token) {
  return axios.delete(apiEndpoint + _id, {
    headers: {
      "x-auth-token": token,
    },
  });
}

export function likePost(like, _id, token) {
  return axios.put(
    apiEndpoint + _id,
    { like },
    { headers: { "x-auth-token": token, "x-edit-post": true } }
  );
}

export function commentPost(comment, _id, token) {
  return axios.put(
    apiEndpoint + _id,
    { comment },
    { headers: { "x-auth-token": token, "x-edit-post": true } }
  );
}

export function deletePostComment(_id, _postId, token) {
  return axios.delete(apiEndpoint + _postId, {
    headers: {
      "x-auth-token": token,
      "x-comment-id": _id,
    },
  });
}

export function putPostComment(comment, _id, _postId, token) {
  return axios.put(
    apiEndpoint + _postId,
    { comment },
    {
      headers: {
        "x-auth-token": token,
        "x-comment-id": _id,
      },
    }
  );
}

export async function getPostImage(path) {
  const response = await axios.get(path, { responseType: "blob" });
  return new File([response.data], path.slice(8, path.length), {
    type: "image/png",
  });
}
