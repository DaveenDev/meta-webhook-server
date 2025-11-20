import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔑 Config
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "metamake_token";
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// ---------------------------------------------------
// 1️⃣ FACEBOOK WEBHOOK VERIFICATION
// ---------------------------------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✔ Verified webhook successfully");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ---------------------------------------------------
// 2️⃣ RECEIVE FACEBOOK EVENTS + FORWARD TO MAKE.COM
// ---------------------------------------------------
app.post("/webhook", async (req, res) => {
  console.log("📬 Received Facebook Webhook Event");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    console.log("➡ Forwarded to Make.com successfully");
  } catch (err) {
    console.error("❌ Error forwarding to Make.com:", err);
  }

  res.sendStatus(200);
});

// ---------------------------------------------------
// 3️⃣ NEW ENDPOINT: GET PAGE ACCESS TOKENS
// ---------------------------------------------------
// Call this URL: GET /get-page-tokens?user_token=EAAG.....

app.get("/get-page-tokens", async (req, res) => {
  const userToken = req.query.user_token;

  if (!userToken) {
    return res.status(400).json({
      error: "Missing required query parameter: user_token",
    });
  }

  const url = `https://graph.facebook.com/me/accounts?access_token=${userToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("📄 Page Token Result:", data);

    return res.status(200).json({
      message: "Page tokens fetched successfully",
      data,
    });
  } catch (err) {
    console.error("❌ Error fetching page tokens:", err);
    return res.status(500).json({
      error: "Failed to fetch page tokens",
    });
  }
});

// ---------------------------------------------------
// 4️⃣ START SERVER
// ---------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
