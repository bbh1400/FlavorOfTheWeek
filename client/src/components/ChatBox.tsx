import { useState } from "react";

interface ChatBoxProps {
  onSend: (text: string) => void;
}

export function ChatBox({ onSend }: ChatBoxProps) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form
      className="chat-box"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Say something..."
        maxLength={140}
      />
      <button type="submit">Send</button>
    </form>
  );
}
