const router = require("express").Router();
const auth = require("../middleware/auth");
const { Post } = require("../models/post");

router.post("/", auth, async (req, res) => {
  const { body } = req;
  
});

module.exports = router;
