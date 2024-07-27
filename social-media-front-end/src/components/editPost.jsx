import React, { createRef } from "react";
import { editPost, getPostImage } from "../services/posts";
import Form from "../common/Form/Form";
import { getToken } from "../utils/token";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "bootstrap";

class EditPost extends Form {
  fileInputRef = createRef(null);
  errorValidation = false;
  modal = undefined;
  state = {
    post: {},
    data: {
      image: {},
      imagePath: "",
      caption: "",
    },
  };

  // Called once the model is shown.
  // Think of it as (async void componentDidMount())
  getData = async (post) => {
    console.log(post);

    const { _image, _imagePath, _caption } = this.state.data;
    if (_image && _imagePath && _caption) return;

    try {
      let { data } = { ...this.state };
      const { imagePath, caption } = post;
      const image = imagePath && (await getPostImage(imagePath));

      data = {
        caption,
        imagePath,
        image,
      };

      this.setState({ post, data });
    } catch (error) {
      console.log(`Can't get PostImage => ${error.message}`);
    }

    if (!this.modal) this.modal = new Modal("#editPostModal");
    this.modal.show();
  };

  componentDidMount() {
    this.props.getDataRefrence(this.getData);
  }

  doSubmit = async () => {
    const { post } = this.state;
    const { image, caption } = this.state.data;

    let formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    const token = getToken();

    try {
      await editPost(post._id, formData, token);

      // TODO: Client Prediction && Server Reconciliation
      window.location.reload();
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }
  };

  handleFileChange = ({ currentTarget: input }) => {
    const image = input.files[0];
    if (!image) return;

    try {
      const reader = new FileReader();
      const data = { ...this.state.data };

      reader.onload = (e) => {
        data.imagePath = e.target.result;
        data.image = input.files[0];

        this.setState({ data });
      };

      reader.readAsDataURL(image);
    } catch {}
  };

  render() {
    const { user } = this.props;
    const { image, imagePath } = this.state.data;

    return (
      <div className="modal fade" id="editPostModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Post Update</h1>
              <button
                type="button"
                className="btn-close shadow-none"
                onClick={() => {
                  this.modal.hide();
                }}
              />
            </div>
            <div className="modal-body">
              <div className="d-flex gap-2 mb-1">
                <img
                  src={user.avatarPath}
                  height={45}
                  width={45}
                  className="avatar rounded-circle"
                />
                {this.renderTextArea("caption", "Write your thoughts...")}
              </div>
              <>
                <p className="muted mb-2">Upload Image</p>
                <div
                  onClick={() => this.fileInputRef.current.click()}
                  className="drop-box d-flex flex-column justify-content-center align-items-center w-100 h-100"
                >
                  {imagePath ? (
                    <>
                      <img className="drop-box-file" src={imagePath} />
                      <p className="fs-6 mt-2 d-inline-block text-truncate">
                        {image.name}
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
                  onChange={this.handleFileChange}
                  ref={this.fileInputRef}
                  style={{ display: "none" }}
                />
              </>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              {this.renderButton("Publish Post")}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditPost;
