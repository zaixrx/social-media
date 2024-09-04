import React from "react";

function PopUp({
  modalId,
  headerLabel,
  children,
  footer,
  onSubmit,
  showFooter = true,
}) {
  return (
    modalId && (
      <div className="modal fade" id={modalId}>
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">{headerLabel}</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="modal-body">{children}</div>
            {showFooter && (
              <div className="modal-footer d-flex justify-content-between">
                {footer}
                <button className="btn btn-primary" onClick={onSubmit}>
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}

export default PopUp;
