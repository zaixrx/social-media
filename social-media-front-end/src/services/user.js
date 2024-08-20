import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/token";

const API_ENDPOINT = `http://${window.location.hostname}:3000/api/users/`;

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
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    console.log(`Failed to decode Token`, error);
  }
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
