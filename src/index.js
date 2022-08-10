const { connectDatabase } = require("./utils/db");
const { initializeClient } = require("./utils/client");
const dotenv = require("dotenv");
dotenv.config();

connectDatabase().then(() => {
  console.log("Connected to DB. Initializing client.");

  initializeClient();
});
