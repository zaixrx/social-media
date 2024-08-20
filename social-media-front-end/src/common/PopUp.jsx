import React from "react";

function PopUp({ modalId, headerLabel, children, footer, onSubmit }) {
  return (
    modalId && (
      <div className="modal fade" id={modalId}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">{headerLabel}</h1>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer d-flex justify-content-between">
              {footer}
              <button className="btn btn-primary" onClick={onSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default PopUp;
