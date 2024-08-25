import axios from "axios";

const apiLink = `${process.env.REACT_APP_API_URL}/users`;

export function registerUser(data) {
  return axios.post(apiLink, data);
}
