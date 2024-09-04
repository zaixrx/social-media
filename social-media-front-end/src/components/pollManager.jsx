import React, { useState } from "react";
import PopUp from "../common/PopUp";
import FormInput from "../common/new/FormInput";
import FormCheckBox from "../common/new/FormCheckBox";
import ProgressBar from "../common/ProgressBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showMessage } from "../utils/logging";
import { Modal } from "bootstrap";

function PollManager({ onSubmit }) {
  const [options, setOptions] = useState([""]);

  function handlePollSumbition() {
    let emptys = [];

    options.forEach((option, index) => {
      if (!option) emptys.push(index + 1);
    });

    if (emptys.length)
      return showMessage(`Option(s) ${[...emptys]} must not be empty`);

    onSubmit(options);
    new Modal("#pollManagerModal").hide();
  }

  return (
    <PopUp
      modalId="pollManagerModal"
      headerLabel="Manage Your Poll"
      onSubmit={handlePollSumbition}
    >
      <fieldset className="d-flex flex-column gap-2">
        {options.map((option, index) => {
          const setter = (value) => {
            setOptions(() => {
              const _options = [...options];
              _options[index] = value;
              return _options;
            });
          };

          const remove = () => {
            if (options.length <= 1) return;

            setOptions(() => {
              const _options = [...options];
              _options.splice(index, 1);
              return _options;
            });
          };

          return (
            <div key={index} className="d-flex align-items-center gap-2">
              <FormInput
                label={`Option ${index + 1}`}
                setter={setter}
                value={option}
              />
              <div
                className="d-flex align-items-center justify-content-center text-white bg-secondary bg-gradient rounded-circle clickable"
                style={{ width: 25, height: 25 }}
                onClick={remove}
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              </div>
            </div>
          );
        })}
        <button
          onClick={() => setOptions([...options, ""])}
          className="btn btn-secondary bg-gradient"
        >
          Add Option
        </button>
      </fieldset>
    </PopUp>
  );
}

export function PollOption({
  id,
  label,
  votes,
  onPollOptionVote,
  checked,
  percentage,
}) {
  return (
    <div className="p-3 border">
      <div className="d-flex gap-2 mb-2">
        <FormCheckBox
          checkBoxID={id}
          checkBoxName={label}
          className="d-flex align-items-center gap-2"
          checked={checked}
          onChange={(checked) => onPollOptionVote(id, checked)}
        />
        <p className="text-secondary">{votes.length} Votes</p>
      </div>
      <ProgressBar percentage={percentage} />
    </div>
  );
}

export function getTotalPollVotes(pollOptions) {
  return pollOptions.reduce(
    (acc, pollOption) => acc + pollOption.votes.length,
    0
  );
}

export default PollManager;
