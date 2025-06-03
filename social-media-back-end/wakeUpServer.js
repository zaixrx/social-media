const axios = require("axios");
// Used to not let the server shut down after 15 minutes.
module.exports = function () {
  /*setInterval(() => {
    axios
      .get(process.env.REFRESH_API_ENDPOINT)
      .then(() => console.log("Server Wake Up"))
      .catch(({ message, response }) =>
        console.error(response ? response : message)
      );
  }, 1000 * 60 * 15);*/
};
