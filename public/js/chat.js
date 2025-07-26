document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const userId = localStorage.getItem("userId");
  const receiverId = new URLSearchParams(window.location.search).get("user"); // ?user=receiverId
  const token = localStorage.getItem("token");
  const chatBox = document.getElementById("chat-box");
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message");
  let myName = "You";
  let theirName = "Them";
  if (!userId || !receiverId) {
    alert("Missing user information.");
    return;
  }
  socket.emit("join", userId);

  // Fetch both user names
  async function fetchNames() {
    const [meRes, themRes] = await Promise.all([
      fetch(`/api/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/profile/${receiverId}`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (meRes.ok) myName = (await meRes.json()).name || "You";
    if (themRes.ok) theirName = (await themRes.json()).name || "Them";
  }

  // Load chat history
  async function loadChatHistory() {
    await fetchNames();
    const res = await fetch(`/api/chats/${receiverId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return;
    const messages = await res.json();
    messages.forEach(msg => {
      addMessage(msg.senderId == userId ? myName : theirName, msg.content);
    });
  }
  loadChatHistory();

  async function isChatAllowed(bookingId) {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return false;
    const booking = await res.json();
    return booking && booking.isPaid;
  }

  // Send message
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;
    const bookingId = new URLSearchParams(window.location.search).get("bookingId");
    if (!bookingId || !(await isChatAllowed(bookingId))) {
      alert("Chat is locked until payment is complete.");
      return;
    }
    // Save message to backend
    await fetch("/api/chats/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ receiverId, content: message, bookingId })
    });
    socket.emit("private-message", { senderId: userId, receiverId, content: message });
    addMessage(myName, message);
    messageInput.value = "";
  });

  // Receive message
  socket.on("private-message", ({ senderId, content }) => {
    if (senderId == userId) return; // Don't duplicate your own message
    addMessage(theirName, content);
  });

  function addMessage(sender, content) {
    const msg = document.createElement("div");
    msg.classList.add("message");
    msg.innerHTML = `<strong>${sender}:</strong> ${content}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
