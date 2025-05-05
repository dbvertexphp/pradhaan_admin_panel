const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const axios = require("axios");

// Use environment variables to store your Razorpay credentials
const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID || "rzp_test_yds44ayQjStCiB";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "OQxUntrCV2bbk3fiB5CmmbGE";

exports.helloWorlds = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// Razorpay को Initialize करें
const razorpayInstance = new Razorpay({
  key_id: "rzp_test_yds44ayQjStCiB", // अपनी Razorpay Key ID यहां डालें
  key_secret: "OQxUntrCV2bbk3fiB5CmmbGE", // अपनी Razorpay Secret Key यहां डालें
});

// Create Order function
exports.addCustomer = functions.https.onRequest(async (req, res) => {
  const { name, email, contact, accountNumber, ifsc } = req.body;

  try {
    // Step 1: Create Razorpay contact
    const customerResponse = await axios.post(
      "https://api.razorpay.com/v1/contacts",
      {
        name,
        email,
        contact,
        type: "customer",
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    const customerId = customerResponse.data.id;

    // Step 2: Link bank account
    const fundAccountResponse = await axios.post(
      "https://api.razorpay.com/v1/fund_accounts",
      {
        contact_id: customerId,
        account_type: "bank_account",
        bank_account: {
          name,
          ifsc,
          account_number: accountNumber,
        },
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    res.json({ fundAccount: fundAccountResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to transfer amount
exports.transferAmount = functions.https.onRequest(async (req, res) => {
  const { accountId, amount } = req.body;

  try {
    const transferResponse = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      {
        account_id: accountId,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        purpose: "payout",
        mode: "IMPS", // or NEFT/UPI
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    res.json({ transfer: transferResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
