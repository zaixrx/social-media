import React, { useState, useEffect } from "react";

function Paragpragh({ children, ...others }) {
  const [output, setOutput] = useState([]);

  useEffect(() => {
    let _output = [];
    const words = children.split(" ");
    words.forEach((word) => {
      if (word.startsWith("https://") || word.startsWith("https://"))
        _output.push(
          <a key={_output.length} href={word}>
            {word}
          </a>
        );
      else _output.push(`${word.toString()} `);
    });
    setOutput(_output);
  }, []);

  return <p {...others}>{output.map((obj) => obj)}</p>;
}

export default Paragpragh;
