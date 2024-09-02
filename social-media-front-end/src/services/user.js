import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getToken, setToken } from "../utils/token";

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

export function regenerateAuthToken() {
  const authToken = getToken();
  if (!authToken) return null;
  try {
    return axios.post(API_ENDPOINT + "token", { authToken });
  } catch (error) {
    if (error.response) {
      console.log("Invalid server response", error.response.data);
    }
    alert(error.message);
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
