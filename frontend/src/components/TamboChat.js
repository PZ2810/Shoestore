import React, { useState } from "react";

export default function TamboChat({ shoes }) {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const askTambo = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("https://api.tambo.ai/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_TAMBO_API_KEY}`,
        },
        body: JSON.stringify({
          message: input,
          context: { shoes },
        }),
      });

      const data = await res.json();
      setReply(data.reply || "No response from AI");
    } catch (err) {
      setReply("AI error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 40, padding: 20, border: "1px solid #ccc" }}>
      <h3>🤖 Shoe Assistant (Tambo AI)</h3>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about shoes..."
        rows={3}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={askTambo} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {reply && <p style={{ marginTop: 10 }}>{reply}</p>}
    </div>
  );
}
