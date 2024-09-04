import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getToken, setToken } from "../utils/token";
import { showMessage } from "../utils/logging";

const API_ENDPOINT = `${process.env.REACT_APP_API_URL}/users/`;

export function getUser(_id) {
  return axios.get(API_ENDPOINT + _id);
}

export function searchUsers(query) {
  return axios.get(API_ENDPOINT, { headers: { "x-query": query } });
}

export function editUser(_id, data, type = "default") {
  const token = getToken();
  if (!token) return null;
  return axios.put(API_ENDPOINT + _id, data, {
    headers: { "x-auth-token": token, "x-type": type },
  });
}

export function getCurrentUser() {
  const token = getToken();
  try {
    return jwtDecode(token);
  } catch {}
  return {};
}

export async function regenerateAuthToken() {
  const authToken = getToken();
  if (!authToken) return;

  try {
    const { regenerationToken } = jwtDecode(authToken);
    const { data: newToken } = await axios.post(API_ENDPOINT + "token", {
      regenerationToken,
    });
    return newToken;
  } catch ({ response, message }) {
    showMessage("Cant regenerate token: ", response ? response.data : message);
  }
}

export function validateUserData(username, email) {
  return axios.post(API_ENDPOINT + "validate", { username, email });
}

export async function sendFollowUserRequest(targetUserID) {
  const { data: token } = await editUser(targetUserID, null, "follow");
  setToken(token);
}

export async function sendUnfollowUserRequest(targetUserID) {
  const { data: token } = await editUser(targetUserID, null, "unfollow");
  setToken(token);
}
