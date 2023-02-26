const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//create wallet transaction

router.post("/", verifyToken, async (req, res) => {
  const newWalletTransaction = new WalletTransaction(req.body);
  try {
    const savedWalletTransaction = await newWalletTransaction.save();
    res.status(200).json(savedWalletTransaction);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update wallet
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedWallet = await Wallet.findByIdAndUpdate(req.params.id, {
      $inc: { balance: req.body },
    });
    res.status(200).json(updatedWallet);
  } catch (error) {
    res.status(500).json(error);
  }
});

//wallet balance
router.get("/:id/balance", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const wallet = await Wallet.findOne({ userId });
    res.status(200).json(wallet.balance);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
