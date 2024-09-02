import axios from "axios";

export default {
  start: () =>
    setInterval(() => {
      axios
        .get(process.env.REACT_APP_API_URL)
        .catch(({ message, response }) =>
          console.error(response ? response : message)
        );
    }, 1000 * 60 * 14),
};
