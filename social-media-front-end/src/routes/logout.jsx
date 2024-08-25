import React, { useEffect } from "react";
import { removeToken } from "../utils/token";

function Logout() {
  useEffect(() => {
    removeToken();
    window.location = "/";
  }, []);

  return null;
}

export default Logout;
