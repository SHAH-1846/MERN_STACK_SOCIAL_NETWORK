const express = require('express');
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({Msg: "User Works"})
});

module.exports= router;
