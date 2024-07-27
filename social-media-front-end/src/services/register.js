import axios from "axios";

const apiLink = `http://${window.location.hostname}:3000/api/users`;

export function registerUser(data) {
  return axios.post(apiLink, data);
}
