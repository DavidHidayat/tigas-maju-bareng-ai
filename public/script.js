const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function appendMessage(role, content, isMarkdown = false, isTyping = false) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", role);

  if (isTyping) {
    wrapper.classList.add("typing");
    wrapper.textContent = content;
  } else {
    wrapper.innerHTML = isMarkdown
      ? marked.parse(content)
      : content;
  }

  const time = document.createElement("div");
  time.className = "time";
  time.textContent = getTime();

  wrapper.appendChild(time);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  return wrapper;
}

/* ENTER = SEND, SHIFT+ENTER = NEW LINE */
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});
  
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";
  input.style.height = "auto";

  const typingMessage = appendMessage(
    "bot",
    "Mas Angga is typing...",
    false,
    true
  );

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation: [
        {
            "role" : "user",
            "text" : userMessage
        }
    ]
      })
    });

    const data = await response.json();

    typingMessage.remove();

    if (data.result) {
      appendMessage("bot", data.result, true);
    } else {
      appendMessage("bot", "Sorry, no response received.");
    }

  } catch (error) {
    typingMessage.remove();
    appendMessage("bot", "Failed to get response from server.");
  }
});
