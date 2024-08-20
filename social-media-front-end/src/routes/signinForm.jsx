import React, { useState } from "react";
import Joi from "joi";
import _ from "lodash";
import { Link } from "react-router-dom";
import { setToken } from "../utils/token.js";
import { authUser } from "../services/auth.js";
import { schemas } from "../common/new/formData.js";
import FormInput from "../common/new/FormInput.jsx";
import FormPassword from "../common/new/FormPassword.jsx";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const schema = new Joi.object({
      email: schemas.email,
      password: schemas.password,
    });
    const { error } = schema.validate({ email, password });
    setError(error && error.details[0].message);

    if (error) return;

    try {
      const { data } = await authUser(email, password);
      setToken(data);
      window.location = "/";
    } catch ({ response }) {
      if (response) setError(response.data);
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center flex-grow-1">
      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column gap-2 form-container"
      >
        <h1>Sign In</h1>
        <FormInput
          label="Email"
          validationPath="email"
          setter={setEmail}
          value={email}
        />
        <FormPassword
          label="Password"
          validationPath="password"
          setter={setPassword}
          value={password}
        />
        <Link to="/signup">Don't have an Account?</Link>
        {error && (
          <div className="text-danger bg-danger-subtle border border-danger rounded p-2">
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default SignInForm;
