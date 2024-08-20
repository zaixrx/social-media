import axios from "axios";

const apiLink = `http://${window.location.hostname}:3000/api/auth`;

export function authUser(email, password) {
  return axios.post(apiLink, {
    email,
    password,
  });
}
