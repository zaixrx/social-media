import React, { Component } from "react";
import Form from "../common/Form/Form";
import Joi from "joi";
import { registerUser } from "../services/register.js";

class RegisterForm extends Form {
  state = {
    data: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreement: false,
    },
    errors: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreement: "",
    },
  };

  schemaObject = {
    username: Joi.string().required().label("Username"),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label("Email"),
    password: Joi.string().required().label("Password"),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match" }),
    agreement: Joi.boolean()
      .invalid(false)
      .label("Agreement")
      .messages({ "any.invalid": "You must agree before submitting." }),
  };

  schema = Joi.object(this.schemaObject).with("password", "confirmPassword");

  async doSubmit() {
    try {
      const { username, email, password } = this.state.data;
      const response = await registerUser({ username, email, password });
      localStorage.setItem("token", response.headers["x-auth-token"]);
      window.location = "/";
    } catch ({ response }) {
      if (response && response.status === 400) {
        const errors = { ...this.state.errors };
        errors[response.headers["x-error-path"]] = response.data;
        return this.setState({ errors });
      }
    }
  }

  render() {
    return (
      <div className="d-flex align-items-center py-4 fill-screen">
        <main className="w-100 m-auto form-container">
          <form>
            <h1 className="h3 mb-3 fw-normal">Sign in</h1>
            {this.renderInput("username", "Username", "text")}
            {this.renderInput("email", "Email", "text")}
            {this.renderInput("password", "Password", "password")}
            {this.renderInput(
              "confirmPassword",
              "Confirm Password",
              "password"
            )}
            {this.renderCheckBox("agreement", "Agree to terms and conditions")}
            {this.renderButton("Sign up")}
          </form>
        </main>
      </div>
    );
  }
}

export default RegisterForm;
