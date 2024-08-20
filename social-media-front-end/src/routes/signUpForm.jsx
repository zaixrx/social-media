import React, { useState } from "react";
import Joi from "joi";
import _ from "lodash";
import { setToken } from "../utils/token.js";
import { schemas } from "../common/new/formData.js";
import { registerUser } from "../services/register.js";
import FormInput from "../common/new/FormInput.jsx";
import FormPassword from "../common/new/FormPassword.jsx";
import { validateUserData } from "../services/user.js";
import { Link } from "react-router-dom";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pages = [
    {
      view: (
        <>
          <FormInput
            label="First Name"
            validationPath="firstName"
            setter={setFirstName}
            value={firstName}
          />
          <FormInput
            label="Last Name"
            validationPath="lastName"
            setter={setLastName}
            value={lastName}
          />
          <FormInput
            label="Username"
            validationPath="username"
            setter={setUsername}
            value={username}
          />
          <FormInput
            label="Email"
            validationPath="email"
            setter={setEmail}
            value={email}
          />
        </>
      ),
      schema: new Joi.object({
        email: schemas.email,
        firstName: schemas.firstName,
        lastName: schemas.lastName,
        username: schemas.username,
      }),
      data: {
        firstName,
        lastName,
        email,
        username,
      },
    },
    {
      view: (
        <>
          <FormPassword
            label="Password"
            validationPath="password"
            setter={setPassword}
            value={password}
          />
          <FormPassword
            label="Confirm Password"
            setter={setConfirmPassword}
            value={confirmPassword}
          />
        </>
      ),
      schema: new Joi.object({
        password: schemas.password,
        confirmPassword: schemas.confirmPassword,
      }).with("password", "confirmPassword"),
      data: {
        password,
        confirmPassword,
      },
    },
  ];

  /**
   * profile not responsive => Done
   * follow / unfollow => Done
   * replace users you may know with following... => Done
   * username lowercase / password strong meter => Done
   * login server validation message => Done
   * Add the ability to edit all user information && change the change avatar UI => Done
   * Add Chat Contacts => No
   * Interacte with messages / comments => Done
   * Custom emojies selection => Done
   * Don't send all user information with the room
   * Custom photo selection => 50% (Rest UI)
   * Send videos and pictures with post
   * Send videos and pictures with chat
   */

  async function handleSubmit(e) {
    e.preventDefault();

    const currentPage = pages[currentPageIndex];
    const schema = currentPage.schema;

    const { error } = schema.validate(currentPage.data);
    setError(error && error.details[0].message);
    if (error) return;

    if (currentPageIndex === 0) {
      const { data: result } = await validateUserData(username, email);
      if (result !== true) return setError(result);
    }

    setCurrentPageIndex(currentPageIndex + 1);
    if (currentPageIndex < pages.length - 1) return;

    try {
      const { headers } = await registerUser({
        firstName,
        lastName,
        username,
        email,
        password,
      });
      setToken(headers["x-auth-token"]);
      window.location = "/";
    } catch (error) {
      const { response } = error;
      if (!response || !response.status === 404)
        return console.log(error.message);
      setError(response.data);
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center flex-grow-1">
      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column gap-2 form-container"
      >
        <h1>Sign Up</h1>
        <div
          className="progress"
          role="progressbar"
          aria-label="Basic example"
          aria-valuenow={(
            (currentPageIndex * 100) /
            (pages.length - 1)
          ).toString()}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="progress-bar"
            style={{ width: `${(currentPageIndex * 100) / pages.length}%` }}
          ></div>
        </div>
        {pages[currentPageIndex]?.view}
        {error && (
          <div className="text-danger bg-danger-subtle border border-danger rounded p-2">
            {error}
          </div>
        )}
        <Link to="/signin">Already have an Account?</Link>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
