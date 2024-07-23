import React, { createRef } from "react";
import Form from "../common/Form/Form";
import { publishPost } from "../services/posts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class SharePost extends Form {
  errorValidation = false;
  inputImage = createRef(null);
  state = {
    data: {
      caption: "",
      image: {},
    },
  };

  async doSubmit() {
    const { image, caption } = this.state.data;

    const token = localStorage.getItem("token");

    if (!token) return this.props.history.push("/signin");

    if (caption.trim() === "") return alert("Caption must not be empty.");

    let formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);

    try {
      await publishPost(formData, token);
      window.location.reload();
    } catch (error) {
      alert(error.response.data);
    }
  }

  handleTestChange = (e) => {
    const data = { ...this.state.data };
    data.image = e.currentTarget.files[0];
    this.setState({ data });
  };

  render() {
    const { user } = this.props;
    const { image } = this.state.data;

    return (
      <div className="card p-3">
        <form className="w-100 d-flex">
          <img
            height={50}
            width={50}
            src={user.avatarPath}
            className="avatar rounded-circle me-3"
          />
          {this.renderTextArea(
            "caption",
            "Publish your sad thoughts to this mad blue sphere that is rotating around (7.2921150 ± 0.0000001)×10^(−5) (rad/s)..."
          )}
        </form>
        <div className="d-flex justify-content-between mt-3">
          <div className="d-flex gap-2 text-start align-items-center">
            <div
              className="icon-btn d-flex gap-2 text-success"
              onClick={() => this.inputImage.current.click()}
            >
              <FontAwesomeIcon icon="fa-regular fa-image" />
              Image
            </div>
            <input
              name="image"
              accept="image/png, image/jpg, image/gif, image/jpeg"
              ref={this.inputImage}
              onChange={this.handleTestChange}
              style={{ display: "none" }}
              type="file"
            />
            {image && (
              <small className="text-truncate text-stop text-small">
                {image.name}
              </small>
            )}
          </div>
          {this.renderButton("Post")}
        </div>
      </div>
    );
  }
}

export default SharePost;
