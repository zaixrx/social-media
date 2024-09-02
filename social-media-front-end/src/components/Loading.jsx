import React, { useState, useEffect } from "react";

function Loading({ visible }) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const surahNumber = Math.floor(Math.random() * 114);
        const surahURL = "https://api.alquran.cloud/v1/surah/" + surahNumber;

        const response = await fetch(surahURL);
        const chapterJSON = await response.json();

        const totalAyahs = chapterJSON.data.numberOfAyahs;
        const ayahNumber = Math.floor(Math.random() * totalAyahs);

        setStatus(`${chapterJSON.data.ayahs[ayahNumber].text}`);
      } catch (error) {
        setStatus("The server might be as sleep let me wake him up for you!");
      }
    })();
  }, []);

  return (
    <div className="bg-white fill d-flex flex-column align-items-center justify-content-center gap-3">
      <div
        className="spinner-grow text-primary"
        style={{ width: "3rem", height: "3rem" }}
      />
      <span className="text-primary text-center" style={{ maxWidth: 300 }}>
        {status}
      </span>
    </div>
  );
}

export default Loading;
