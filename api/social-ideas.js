import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { profession, audience, goal, platform, tone, postCount } = req.body;

  if (!profession || !audience || !goal || !platform || !tone || !postCount) {
    return res.status(400).json({ error: "Missing input fields" });
  }

  const prompt = `
I am a ${profession} targeting ${audience}. 
My goal is ${goal}. Generate ${postCount} social media content ideas for ${platform} in a ${tone} tone. 
Include captions, hashtags, and formats. Respond in markdown table format.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a creative, helpful social media strategist." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const result = completion.choices[0].message.content;
    res.status(200).json({ result });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
}
