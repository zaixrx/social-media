import axios from "axios";

const apiLink = `http://${window.location.hostname}:3000/api/users`;

export function registerUser({ username, email, password }) {
  return axios.post(apiLink, {
    username,
    email,
    password,
  });
}
