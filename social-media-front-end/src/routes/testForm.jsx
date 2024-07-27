import React, { useState } from "react";
import Joi from "joi";
import Input from "../common/Form/inputField";
import CheckBox from "../common/Form/CheckBox";

function TestForm() {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState();
  const [currentPage, setCurrentPage] = useState(0);

  const schemaPages = [
    new Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      username: Joi.string().required(),
      email: Joi.string().required(),
    }).options({ allowUnknown: true }),
    new Joi.object({
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    }).options({ allowUnknown: true }),
  ];

  const pages = [
    <>
      <p className="mb-2">Register you public informations.</p>
      <Input
        name="firstName"
        label="First Name"
        value={data.firstName}
        onChange={handleInputChange}
      />
      <Input
        name="lastName"
        label="Last Name"
        value={data.lastName}
        onChange={handleInputChange}
      />
      <Input
        name="username"
        label="Username"
        value={data.username}
        onChange={handleInputChange}
      />
      <Input
        name="email"
        label="Email"
        value={data.email}
        onChange={handleInputChange}
      />
    </>,
    <>
      <p className="mb-2">Choose a good password!</p>
      <Input
        type="password"
        name="password"
        label="Password"
        value={data.password}
        onChange={handleInputChange}
      />
      <Input
        type="password"
        name="confirmPassword"
        label="Confirm Password"
        value={data.confirmPassword}
        onChange={handleInputChange}
      />
      <CheckBox label="Show Password" onChange={handleShowPassword} />
    </>,
  ];

  function handleInputChange({ target }) {
    const _data = { ...data };
    _data[target.name] = target.value;
    setData(_data);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const { error } = schemaPages[currentPage].validate(data);
    setErrors(error);
    if (error) return console.log("ERROR: ", error.details[0].message);

    const isInLastPage = currentPage === pages.length - 1;
    if (isInLastPage) {
      alert("Submit");
    }
    setCurrentPage(currentPage + 1);
  }

  function handleShowPassword({ target }) {
    const type = target.checked ? "text" : "password";
    const passwords = document.getElementsByName("password");
    for (let password of passwords) {
      password.type = type;
    }
  }

  return (
    <div className="main">
      <div className="d-flex justify-content-center align-items-center py-4 fill-screen">
        <main className="w-100 m-auto form-container">
          <form onSubmit={handleSubmit}>
            <div
              className="progress"
              role="progressbar"
              aria-label="Basic example"
              aria-valuenow="25"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="progress-bar"
                style={{
                  width: `${Math.round((100 * currentPage) / pages.length)}%`,
                }}
              ></div>
            </div>
            <h3 className="h3 mb-3 fw-normal">Register</h3>
            {pages[currentPage]}
            <button className="btn btn-primary">
              {currentPage === pages.length - 1 ? "Register" : "Next"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default TestForm;
