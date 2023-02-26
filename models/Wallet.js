const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    userId: {
      type: String,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", WalletSchema);
