import React, { Component } from "react";
import Input from "./inputField";
import SelectMenu from "../SelectMenu";
import CheckBox from "./CheckBox";
import TextArea from "./TextArea";
import FileInput from "./FileInput";
import Joi from "joi";
import DropBox from "./DropBox";

// "Requires a schema and schemaObject" //
class Form extends Component {
  errorValidation = true;

  state = {
    data: {},
    errors: {},
  };

  validate = () => {
    if (!this.errorValidation) return null;

    if (!this.schema) throw new Error("Schema is undefined");

    const options = { abortEarly: false };
    const { error } = this.schema.validate(this.state.data, options);
    if (!error) return null;

    const errors = {};
    error.details.map((detail) => {
      errors[detail.path[0]] = detail.message;
    });

    return errors;
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (this.errorValidation) {
      const errors = this.validate();
      this.setState({ errors: errors || {} });
      if (errors) return;
    }

    this.doSubmit();
  };

  validateProperty = ({ name, value }) => {
    if (!this.errorValidation) return null;

    const objct = { [name]: value };
    const subSchema = Joi.object({ [name]: this.schemaObject[name] });
    const { error } = subSchema.validate(objct);

    return error && error.details[0].message;
  };

  // TODO: Implement REAL-TIME Validation only for some types
  handleChange = ({ currentTarget: input }) => {
    const data = { ...this.state.data }; // Clone Target
    data[input.name] = input.value; // Set Target Property

    this.setState({ data });
  };

  handleCheckBoxChange = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data[input.name] = input.checked;

    this.setState({ data });
  };

  handleDropBoxChange = ({ currentTarget: input }) => {
    const image = input.files[0];
    if (!image) return;

    try {
      const reader = new FileReader();
      const data = { ...this.state.data };

      reader.onload = (e) => {
        data[input.name] = e.target.result;
        data[input.getAttribute("namedata")] = input.files[0];

        this.setState({ data });
      };

      reader.readAsDataURL(image);
    } catch {}
  };

  renderInput = (name, label, type = "text") => {
    const { data, errors } = this.state;
    return (
      <Input
        name={name}
        type={type}
        label={label}
        value={data[name]}
        error={errors[name]}
        onChange={this.handleChange}
      />
    );
  };

  renderButton = (label) => {
    return (
      <button onClick={this.handleSubmit} className="btn btn-primary py-1">
        {label}
      </button>
    );
  };

  renderTextArea = (name, placeholder) => {
    return (
      <TextArea
        name={name}
        placeholder={placeholder}
        value={this.state.data[name]}
        onChange={this.handleChange}
      />
    );
  };

  renderSelectMenu = (name, label, options) => {
    return (
      <SelectMenu
        name={name}
        label={label}
        options={options}
        value={this.state.data[name]}
        onChange={this.handleChange}
      />
    );
  };

  renderFileInput = (name) => {
    return (
      <FileInput
        name={name}
        value={this.state.data.imagePath}
        onChange={this.handleChange}
      />
    );
  };

  renderCheckBox = (name, label) => {
    const { data, errors } = this.state;

    return (
      <CheckBox
        label={label}
        name={name}
        value={data[name]}
        error={errors[name]}
        onChange={this.handleCheckBoxChange}
      />
    );
  };

  renderDropBox = (name, nameData, label) => {
    // TODO: Implement validation for only images!
    const { data } = this.state;
    return (
      <DropBox
        name={name}
        nameData={nameData}
        label={label}
        value={data[name]}
        file={data[nameData]}
        onChange={this.handleDropBoxChange}
      />
    );
  };
}

export default Form;
