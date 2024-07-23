import React, { createRef } from "react";
import Form from "../common/Form/Form";
import { editUser, regenerateAuthToken } from "../services/user";
import { getToken, setToken } from "../utils/token";

class EditUser extends Form {
  errorValidation = false;
  state = {
    data: {
      url: "",
      avatar: {},
    },
  };

  fileInputRef = createRef(null);

  async doSubmit() {
    const { avatar } = this.state.data;
    const { _id } = this.props.user;

    const data = new FormData();
    data.append("avatar", avatar);

    try {
      await editUser(_id, data);
      const { data: token } = await regenerateAuthToken(getToken());
      setToken(token);
      window.location.reload();
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }
  }

  componentDidMount() {
    let { avatarPath } = this.props.user;
    const data = { ...this.state.data };

    if (avatarPath) {
      data.url = avatarPath;
    } else {
      data.url =
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    }

    this.setState({ data });
  }

  handleFileChange = ({ currentTarget: fileInput }) => {
    if (!fileInput.files[0]) return;

    const data = { ...this.state.data };
    const reader = new FileReader();

    try {
      reader.onload = ({ target }) => {
        data.avatar = fileInput.files[0];
        data.url = target.result;

        this.setState({ data });
      };

      reader.readAsDataURL(fileInput.files[0]);
    } catch (e) {}
  };

  render() {
    const { url } = this.state.data;

    return (
      <div className="modal fade" id="editUserModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Profile Photo</h1>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-center align-items-center">
                <img
                  src={url}
                  height={200}
                  width={200}
                  className="object-fit-cover border rounded-circle"
                />
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              {this.renderButton("Submit Changes")}
              <button
                className="btn btn-primary py-2"
                onClick={() => this.fileInputRef.current.click()}
              >
                Edit Avatar
              </button>
              <input
                type="file"
                onChange={this.handleFileChange}
                ref={this.fileInputRef}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditUser;
