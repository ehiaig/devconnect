const express = require("express");
const router = express.Router();

//@route GET api/posts/test
//@desc gets all tests
//@acccess is public
router.get("/test", (req, res) => res.json({ msg: "Posts works" }));

module.exports = router;
