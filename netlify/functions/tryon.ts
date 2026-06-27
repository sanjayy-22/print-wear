import { Client as WaveSpeed } from "wavespeed";

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY || "";

export async function handler(event: any) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { person_image, clothing_image, wavespeed_api_key } = JSON.parse(event.body || "{}");

    if (!person_image || !clothing_image) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Both person_image and clothing_image are required" }),
      };
    }

    const activeApiKey = wavespeed_api_key || WAVESPEED_API_KEY;

    if (!activeApiKey) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "WaveSpeed API key is missing. Please configure it in your Netlify Environment Variables or Settings UI." }),
      };
    }

    const prompt = "Change the clothes of the person in the first image to wear the customized polo shirt shown in the second image. Fit it naturally on their body, adjusting to their posture and lighting.";

    // Initialize WaveSpeed Client
    const wavespeedClient = new WaveSpeed(activeApiKey);

    // Run the model using the SDK client
    const result = await wavespeedClient.run("openai/gpt-image-2/edit", {
      enable_base64_output: false,
      enable_sync_mode: false,
      images: [person_image, clothing_image],
      output_format: "png",
      prompt: prompt,
      quality: "medium",
      resolution: "1k"
    });

    const outputUrl = result.outputs?.[0] || result.output?.[0] || result.output;

    if (!outputUrl) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Failed to generate try-on result from WaveSpeed",
          raw: result,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        output: outputUrl,
      }),
    };
  } catch (err: any) {
    console.error("WaveSpeed Serverless Try-On Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Try-on failed", details: err.message }),
    };
  }
}
