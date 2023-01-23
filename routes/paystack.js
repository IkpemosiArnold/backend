const router = require("express").Router();
const paystack = require("paystack-api")(
  "sk_test_d532bbb60dd729432fb3461b2b53c55ec54e0bf7"
);

router.post("/payment", (req, res) => {
  paystack.charge.charge();
});

module.exports = router;
