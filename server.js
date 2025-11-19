import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔑 Set your tokens here
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "metamake_token";
const MAKE_WEBHOOK_URL = "https://meta-webhook-server-h6zy.onrender.com"; // Your Make.com webhook

// ---------- STEP 1: FACEBOOK VERIFICATION ----------
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

// ---------- STEP 2: RECEIVE FACEBOOK EVENTS ----------
app.post("/webhook", async (req, res) => {
  console.log("📬 Received Facebook Webhook Event");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Forward the webhook to Make.com
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

// ---------- SERVER START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
