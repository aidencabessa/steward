export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": process.env.KIT_API_KEY,
  };

  try {
    // Step 1: Create or update the subscriber
    const createRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error("Create subscriber failed:", createData);
      return res.status(createRes.status).json({ error: "Failed to create subscriber" });
    }

    const subscriberId = createData.subscriber?.id;
    if (!subscriberId) {
      return res.status(500).json({ error: "No subscriber ID returned" });
    }

    // Step 2: Add subscriber to the form
    const formRes = await fetch(`https://api.kit.com/v4/forms/9459810/subscribers/${subscriberId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    if (!formRes.ok) {
      const formData = await formRes.json();
      console.error("Add to form failed:", formData);
      // Still return success since subscriber was created
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: err.message });
  }
}
