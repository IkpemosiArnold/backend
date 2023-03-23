const router = require("express").Router();
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      telephone: req.body.telephone,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString(),
    });
    const savedUser = await newUser.save();
    console.log(savedUser);
    let wallet = createWallet(savedUser._id.toString());
    console.log(wallet);
    res.status(201).json(savedUser);
  } catch (error) {
    let errorType;
    if (error.keyPattern) {
      errorType = `Sorry, an account has already been created using this ${Object.keys(
        error.keyPattern
      )}`;
    } else {
      errorType = error;
    }
    res.status(500).json(errorType);
  }
});
const createWallet = async (userId) => {
  const wallet = await Wallet.create({
    userId,
  });
  return wallet;
};
//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user)
      return res
        .status(401)
        .json("There is something wrong with the email or password");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (Originalpassword !== req.body.password)
      return res.status(401).json("There is something wrong with the password");

    const accesstoken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "24h" }
    );

    const { password, ...others } = user._doc;
    console.log(process.env.PASS_SEC);
    return res.status(200).json({ ...others, accesstoken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
