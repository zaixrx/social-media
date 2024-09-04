import React, { useRef, useState } from "react";
import { publishPost } from "../services/posts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getToken } from "../utils/token.js";
import { showMessage } from "../utils/logging.js";
import TextArea from "../common/Form/TextArea.jsx";
import PollManager from "./pollManager.jsx";
import { Modal } from "bootstrap";

function SharePost({ user, onNewPost, setIsLoading }) {
  const inputImage = useRef();
  const [image, setImage] = useState({});
  const [caption, setCaption] = useState("");
  const [pollOptions, setPollOptions] = useState([]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!caption.trim() && !image.name && !pollOptions.length) return;
    setIsLoading(true);

    const token = getToken();

    let formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);
    formData.append("pollOptions", [...pollOptions]);

    try {
      await publishPost(formData, token);
      onNewPost();
    } catch ({ response, message }) {
      showMessage(response ? response.data : message);
    }
    setIsLoading(false);
  }

  function handleImageChange({ target }) {
    if (pollOptions) setPollOptions([]);
    setImage(target.files[0]);
  }

  function handlePollSubmition(options) {
    if (image) setImage({});
    setPollOptions(options);
  }

  return (
    <>
      <PollManager onSubmit={handlePollSubmition} />
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
            <div>
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
            </div>
            <div
              className="icon-btn d-flex gap-2 text-info"
              onClick={() => new Modal("#pollManagerModal").show()}
            >
              <FontAwesomeIcon icon="fa-solid fa-square-poll-vertical" />
              Poll
            </div>
            <small>
              {image?.name &&
                `${(image.size / (1024 * 1024)).toFixed(2)} MB Image Selected`}
              {pollOptions.length
                ? `${pollOptions.length} Option(s) Poll Seleted`
                : ""}
            </small>
          </div>
          <button type="submit" className="btn btn-primary">
            Share
          </button>
        </div>
      </form>
    </>
  );
}

export default SharePost;
