const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const cartRoute = require("./routes/cart");
const walletRoute = require("./routes/wallet");
const app = express();
const fetch = require("node-fetch");
const reqStuff = {
  key: "b465dd578d19c5ad9c595d4f259f7c08",
  action: "services",
};

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/carts", cartRoute);
app.use("/api/wallet", walletRoute);

app.get("/verifypayment", async (req, res) => {
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer sk_test_d532bbb60dd729432fb3461b2b53c55ec54e0bf7",
    },
  };
  try {
    const apiResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${req.body.reference}`,
      options
    );
    const apiResponseJson = await apiResponse.json();
    // await db.collection('collection').insertOne(apiResponseJson)
    res.send(apiResponseJson);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

app.post("/jap", async (req, res) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  };
  try {
    const apiResponse = await fetch(
      "https://justanotherpanel.com/api/v2",
      options
    );
    const apiResponseJson = await apiResponse.json();
    // await db.collection('collection').insertOne(apiResponseJson)
    res.send(apiResponseJson);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});
app.listen(5000, () => {
  console.log("server is listening on");
});
