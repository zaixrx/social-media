import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHeart as regularHeart,
  faComment,
  faEye,
  faEyeSlash,
  faImage,
  faPaperPlane,
} from "@fortawesome/free-regular-svg-icons";
import {
  faVideo,
  faHeart as solidHeart,
  faUser,
  faPen,
  faIcons,
  faCheck,
  faCheckDouble,
  faEllipsisVertical,
  faReply,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import awakeServer from "./utils/awakeServer";

library.add(
  regularHeart,
  solidHeart,
  faUser,
  faComment,
  faImage,
  faIcons,
  faEllipsisVertical,
  faPen,
  faCheck,
  faCheckDouble,
  faEye,
  faEyeSlash,
  faPaperPlane,
  faReply,
  faVideo,
  faXmark,
  faPlus
);

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
