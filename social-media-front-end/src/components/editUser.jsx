import React, { useState, useEffect, useRef } from "react";
import PopUp from "../common/PopUp.jsx";
import FormInput from "../common/new/FormInput.jsx";
import FormTextArea from "../common/new/FormTextArea.jsx";
import { editUser } from "../services/user.js";
import { setToken } from "../utils/token.js";

function EditUser({ user }) {
  const avatarFileSelect = useRef();

  const [avatar, setAvatar] = useState({});
  const [avatarPath, setAvatarPath] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setBio(user.bio);
    setAvatarPath(user.avatarPath);
  }, []);

  function handleAvatarChange({ target }) {
    const image = target.files[0];
    if (!image) return;

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        setAvatarPath(e.target.result);
        setAvatar(target.files[0]);
      };

      reader.readAsDataURL(image);
    } catch {}
  }

  async function handleSubmit() {
    if (
      firstName === user.firstName &&
      lastName === user.lastName &&
      bio === user.bio &&
      avatarPath === user.avatarPath
    )
      return window.location.reload();

    let formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("bio", bio);
    formData.append("avatar", avatar);

    try {
      const { data: token } = await editUser(user._id, formData);
      setToken(token);

      window.location.reload();
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }
  }

  return (
    <PopUp
      modalId="editUserModal"
      headerLabel="Edit Your Profile"
      onSubmit={handleSubmit}
    >
      <form className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-3">
          <img
            src={avatarPath}
            className="avatar rounded-circle clickable"
            height={80}
            width={80}
            onClick={() => avatarFileSelect.current.click()}
          />
          <input
            type="file"
            ref={avatarFileSelect}
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <div>
            <h3 className="m-0">{user.username}</h3>
            <p>{user.role}</p>
          </div>
        </div>
        <div className="row g-3">
          <div className="col">
            <FormInput
              label="First Name"
              validationPath="firstName"
              setter={setFirstName}
              value={firstName}
            />
          </div>
          <div className="col">
            <FormInput
              label="Last Name"
              validationPath="lastName"
              setter={setLastName}
              value={lastName}
            />
          </div>
        </div>
        <FormTextArea
          label="Bio"
          validationPath="bio"
          setter={setBio}
          value={bio}
        />
      </form>
    </PopUp>
  );
}

export default EditUser;
