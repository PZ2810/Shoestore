const TAMBO_API_URL = "https://api.tambo.ai/v1/chat";

export async function askTambo({ message, shoes }) {
  const res = await fetch(TAMBO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_TAMBO_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful shopping assistant for an online shoe store.",
        },
        {
          role: "user",
          content: `User question: ${message}\n\nAvailable shoes:\n${JSON.stringify(
            shoes,
            null,
            2
          )}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("Tambo API failed");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
