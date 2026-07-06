const express = require("express");

const purchaseRoutes = require("./routes/purchaseRoutes");

const app = express();

app.use(express.json());

app.use("/purchase", purchaseRoutes);

module.exports = app;