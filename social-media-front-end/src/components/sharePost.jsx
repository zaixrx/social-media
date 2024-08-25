import React, { useRef, useState } from "react";
import { publishPost } from "../services/posts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getToken } from "../utils/token.js";
import { showMessage } from "../utils/logging.js";
import TextArea from "../common/Form/TextArea.jsx";

function SharePost({ user, onNewPost }) {
  const inputImage = useRef();
  const [image, setImage] = useState({});
  const [caption, setCaption] = useState("");

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!caption.trim() && !image.name) return;

    const token = getToken();

    let formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);

    try {
      await publishPost(formData, token);
      onNewPost();
    } catch (error) {
      showMessage(error.response.data);
    }
  }

  function handleImageChange({ target }) {
    setImage(target.files[0]);
  }

  return (
    <form onSubmit={handleFormSubmit} className="card p-3 d-flex gap-2">
      <div className="d-flex">
        <img
          height={50}
          width={50}
          src={user.avatarPath}
          className="avatar rounded-circle me-3"
        />
        <TextArea
          placeholder="Publish your sad thoughts to this mad blue sphere that is rotating around (7.2921150 ± 0.0000001)×10^(−5) (rad/s)..."
          setter={setCaption}
          value={caption}
          className="flex-grow-1"
        />
      </div>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2 text-start">
          <div
            className="icon-btn d-flex gap-2 text-success"
            onClick={() => inputImage.current.click()}
          >
            <FontAwesomeIcon icon="fa-regular fa-image" />
            Image
          </div>
          <input
            name="image"
            accept="image/png, image/jpg, image/gif, image/jpeg"
            ref={inputImage}
            onChange={handleImageChange}
            style={{ display: "none" }}
            type="file"
          />
          {image && (
            <small className="text-truncate text-stop text-small">
              {image.name}
            </small>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Share
        </button>
      </div>
    </form>
  );
}

export default SharePost;
