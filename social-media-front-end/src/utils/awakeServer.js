import axios from "axios";
import cron from "cron";

export default new cron.CronJob("*/14 * * * *", () => {
  console.log("Waking up the server");
  axios
    .get(apiURL)
    .catch(({ message, response }) =>
      console.log(response ? response : message)
    );
});
