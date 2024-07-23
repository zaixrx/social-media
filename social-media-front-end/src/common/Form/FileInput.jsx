import React from "react";

const FileInput = (name, value, onChange, ...rest) => {
  return (
    <div className="input-group">
      <input
        name={name}
        onChange={onChange}
        className="form-control"
        type="file"
        {...rest}
      />
    </div>
  );
};

export default FileInput;

/*

handleFormSubmit = (props) => {
  props.inputField;
  props.selectMenu;
  props.textArea;
};

<Form validation={false}>
  <Form.InputField name="inputField" />
  <Form.SelecMenu name="selectMenu" />
  <Form.TextArea name="textArea" />
  <Form.Submit callback={this.handleFormSubmit}/>
</Form>

*/
