const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hello from server");
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
