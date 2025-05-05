const functions = require("firebase-functions");
const Razorpay = require("razorpay");

// Razorpay को Initialize करें
const razorpayInstance = new Razorpay({
  key_id: process.env.YOUR_RAZORPAY_KEY_ID, // अपनी Razorpay Key ID यहां डालें
  key_secret: process.env.YOUR_RAZORPAY_SECRET, // अपनी Razorpay Secret Key यहां डालें
});

// Create Order function
exports.createOrder = functions.https.onCall(async (data, context) => {
  const amount = data.amount * 100; // Razorpay के लिए राशि पैसे में कन्वर्ट करें

  const options = {
    amount: amount,
    currency: "INR",
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    return { orderId: order.id };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message);
  }
});
