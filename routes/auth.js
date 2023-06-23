const router = require("express").Router();
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
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
    if (!user) {
      return res
        .status(401)
        .json("There is something wrong with the email or password");
    } else if (user) {
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
      const otherHash = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_TWO
      );
      console.log("Sent Password " + req.body.password);
      let originalPassword;
      let otherPassword;
      if (hashedPassword) {
        try {
          const str = hashedPassword.toString(CryptoJS.enc.Utf8);
          console.log(str);
          if (str.length > 0) {
            originalPassword = str;
          }
        } catch (error) {}
      }
      if (otherHash) {
        try {
          const str = otherHash.toString(CryptoJS.enc.Utf8);
          console.log(str);
          if (str.length > 0) {
            otherPassword = str;
          }
        } catch (error) {}
      }

      console.log("Original Password " + originalPassword);
      console.log("2nd Original Password " + otherPassword);

      if (
        originalPassword !== req.body.password &&
        otherPassword !== req.body.password
      ) {
        return res
          .status(401)
          .json("There is something wrong with the password");
      } else if (
        originalPassword === req.body.password ||
        otherPassword === req.body.password
      ) {
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
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//update password
router.post("/reset-password:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.status(401).json("This user does not exist");
  }
  const secret = process.env.JWT_SEC + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    console.log(verify);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
          ).toString(),
        },
      }
    );

    res.status(201).json("Password Updated");
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Something Went Wrong" });
  }
});

//Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.body.email.toLowerCase());
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) {
      return res.status(401).json("This user does not exist");
    }
    const secret = process.env.JWT_SEC + user.password;
    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "59m",
    });
    const link = `https://lvmedia.ng/reset-password/${user._id}/${token}`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_PASS,
      },
      from: process.env.NODE_MAIL,
    });

    let mailOptions = {
      from: "LVmedia",
      to: user.email,
      subject: "Password Reset",
      text:
        "You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
        `${link}\n\n` +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n",
    };
    try {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (error) {
      console.log(error);
    }

    return res.status(200).json("email sent");
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
