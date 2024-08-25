import axios from "axios";

const apiLink = `${process.env.REACT_APP_API_URL}/auth`;

export function authUser(email, password) {
  console.log(apiLink);
  return axios.post(apiLink, {
    email,
    password,
  });
}
