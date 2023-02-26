const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },

    userId: {
      type: String,
      required: true,
    },

    isInflow: { type: Boolean },

    paymentMethod: { type: String, default: "paystack" },

    currency: {
      type: String,
      required: true,
      default: "NGN",
    },

    status: {
      type: String,
      required: [true, "payment status is required"],
      enum: ["successful", "pending", "failed"],
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("walletTransaction", WalletTransactionSchema);
