import React from "react";
import Form from "../common/Form/Form";
import Joi from "joi";
import { Link } from "react-router-dom";
import { authUser } from "../services/auth.js";

class LoginForm extends Form {
  state = {
    data: {
      email: "",
      password: "",
      rememberMe: true,
    },
    errors: {
      email: "",
      password: "",
      rememberMe: "",
    },
  };

  schemaObject = {
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label("Email"),
    password: Joi.string().required().label("Password"),
    rememberMe: Joi.boolean().required(),
  };

  schema = Joi.object(this.schemaObject);

  async doSubmit() {
    try {
      const { email, password } = this.state.data;
      const { data } = await authUser({ email, password });
      localStorage.setItem("token", data);
      window.location = "/";
    } catch (error) {
      const { response } = error;
      if (response && response.status === 404) {
        const errors = { ...this.state.errors };
        errors[response.headers["x-error-path"]] = response.data;
        this.setState({ errors });
      }
      console.log(error.message);
    }
  }

  render() {
    return (
      <div className="d-flex align-items-center py-4 fill-screen">
        <main className="w-100 m-auto form-container">
          <form>
            <h1 className="h3 mb-3 fw-normal">Sign in</h1>
            {this.renderInput("email", "Email", "text")}
            {this.renderInput("password", "Password", "password")}
            {this.renderCheckBox("rememberMe", "Remember me")}
          <Link to="/signup">Do not have an Account?</Link>
            {this.renderButton("Sign in")}
          </form>
        </main>
      </div>
    );
  }
}

export default LoginForm;
