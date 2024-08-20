import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormInput from "./FormInput";

function FormPassword({ ...props }) {
  const inputRef = useRef();
  const [icon, setIcon] = useState("fa-regular fa-eye");

  function triggerPassword() {
    if (!inputRef.current) return;
    let { type } = inputRef.current;

    switch (type) {
      case "password":
        setIcon("fa-regular fa-eye-slash");
        inputRef.current.type = "text";
        break;

      default:
        setIcon("fa-regular fa-eye");
        inputRef.current.type = "password";
        break;
    }
  }

  return (
    <FormInput type="password" innerRef={inputRef} {...props}>
      <button
        type="button"
        className="password-trigger"
        onClick={triggerPassword}
      >
        <FontAwesomeIcon icon={icon} />
      </button>
    </FormInput>
  );
}

export default FormPassword;
