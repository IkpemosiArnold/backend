const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { verifyTokenAndAuthorization } = require("./verifyToken");
dotenv.config();
//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    telephone: req.body.telephone,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    console.log(savedUser);
    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user)
      return res
        .status(401)
        .json("There is something wrong with the username or password");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (Originalpassword !== req.body.password)
      return res
        .status(401)
        .json("There is something wrong with the username or password");

    const accesstoken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "1d" }
    );

    const { password, ...others } = user._doc;

    return res.status(200).json({ ...others, accesstoken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
