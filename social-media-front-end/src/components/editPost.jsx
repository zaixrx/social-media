import React, { useRef, useState, useEffect } from "react";
import { editPost, getPostImage } from "../services/posts";
import { getToken } from "../utils/token";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "bootstrap";
import { showMessage } from "../utils/logging";
import { getFileUrl } from "../utils/file";
import PopUp from "../common/PopUp";
import TextArea from "../common/Form/TextArea";

function EditPost({ user, getDataReference, onPostEdit }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState({});
  const [postID, setPostId] = useState("");
  const [caption, setCaption] = useState("");

  // Called once the model is shown.
  // Think of it as (async void componentDidMount())
  async function getData({ _id, imagePath, caption: _caption }) {
    if (!imagePath && !_caption) return;

    try {
      const _file = await getPostImage(imagePath);
      if (_file) _file.url = imagePath;

      setFile(_file || {});
      setCaption(_caption);
      setPostId(_id);
    } catch (error) {
      showMessage(`Can't fetch post data ${error.message}`);
    }

    new Modal("#editPostModal").show();
  }

  useEffect(() => {
    getDataReference(getData);
  }, []);

  async function handleFormSubmit() {
    const token = getToken();

    let formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      await editPost(postID, formData, token);
      onPostEdit();
    } catch (error) {
      showMessage(
        `Failed to Edit Post: ${error.response?.data || error.message}`
      );
    }
  }

  async function handleFileChange({ target: input }) {
    const inputFile = input.files[0];
    if (!inputFile) return;
    inputFile.url = getFileUrl(inputFile);
    setFile(inputFile);
  }

  return (
    <PopUp
      modalId="editPostModal"
      headerLabel="Update The Post"
      onSubmit={handleFormSubmit}
    >
      <div className="d-flex gap-2 mb-1">
        <img
          src={user.avatarPath}
          height={45}
          width={45}
          className="avatar rounded-circle"
        />
        <TextArea
          placeholder="Publish your sad thoughts to this mad blue sphere that is rotating around (7.2921150 ± 0.0000001)×10^(−5) (rad/s)..."
          setter={setCaption}
          value={caption}
          className="flex-grow-1"
        />
      </div>
      <>
        <p className="muted mb-2">Upload Image</p>
        <div
          onClick={() => fileInputRef.current.click()}
          className="drop-box d-flex flex-column justify-content-center align-items-center w-100 h-100"
        >
          {file.url ? (
            <>
              <img className="drop-box-file" src={file.url} />
              <p
                className="fs-6 mt-2 d-inline-block text-truncate"
                style={{ maxWidth: 200 }}
              >
                {file.name}
              </p>
            </>
          ) : (
            <>
              <FontAwesomeIcon
                style={{ fontSize: "4rem" }}
                icon="fa-regular fa-image"
              />
              <span className="mt-2">Select an Image</span>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/png, image/jpg, image/gif, image/jpeg"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </>
    </PopUp>
  );
}

export default EditPost;
