export function getToken() {
  const result = localStorage.getItem("token");
  return result;
}

export function setToken(token) {
  localStorage.setItem("token", token);
}
