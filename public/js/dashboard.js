// Load provider's active chats (paid bookings with learners)
async function loadProviderChats() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/bookings/provider-chats", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const chats = await res.json();
  const container = document.getElementById("provider-chats");
  container.innerHTML = "";
  if (!chats.length) {
    container.innerHTML = "<em>No active learner chats yet.</em>";
    return;
  }
  chats.forEach(b => {
    const learner = b.Learner?.name || "Learner";
    const skill = b.Skill?.skillName || "Unknown Skill";
    const div = document.createElement("div");
    div.className = "booking";
    div.innerHTML = `
      <strong>${skill}</strong> with <strong>${learner}</strong>
      <a href="/chat.html?bookingId=${b.id}&user=${b.learnerId}">Chat</a>
    `;
    container.appendChild(div);
  });
}
// Show payment modal or trigger payment flow
function showPaymentModal(bookingId, price) {
  // Optionally show alert, then redirect to payment page
  alert(`Proceed to pay ₹${price} for booking #${bookingId}`);
  // Redirect to payment.html with bookingId and price as query params
  window.location.href = `/payment.html?bookingId=${bookingId}&amount=${price}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const suggestionList = document.getElementById("suggestions");
  const resultsContainer = document.getElementById("results");

  // Show provider's own average rating in dashboard if user is a provider
  async function showProviderDashboardRating() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    // Only show if provider-rating-card exists (i.e., user is a provider)
    const card = document.getElementById("provider-rating-card");
    const ratingDiv = document.getElementById("dashboard-profile-rating");
    if (!card || !userId) return;
    try {
      const res = await fetch(`/api/ratings/${userId}`);
      const data = await res.json();
      card.style.display = "block";
      if (data.total > 0) {
        ratingDiv.innerHTML = `<strong>⭐ Rating:</strong> ${data.averageRating} (${data.total} rating${data.total > 1 ? 's' : ''})`;
      } else {
        ratingDiv.innerHTML = `<strong>⭐ Rating:</strong> No ratings yet`;
      }
    } catch (e) {
      card.style.display = "none";
    }
  }

  showProviderDashboardRating();

  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (!query) return (suggestionList.innerHTML = "");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/skills/suggestions?q=${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const skills = await res.json();
      suggestionList.innerHTML = "";
      skills.forEach(skill => {
        const li = document.createElement("li");
        li.textContent = skill.skillName;
        li.onclick = () => {
          input.value = skill.skillName;
          suggestionList.innerHTML = "";
          showResults([skill]);
        };
        suggestionList.appendChild(li);
      });
    } catch (err) {
      console.error("❌ Suggest error:", err);
    }
  });

  async function showResults(skills) {
    resultsContainer.innerHTML = "";
    for (const skill of skills) {
      const card = document.createElement("div");
      card.className = "skill-card";
      let ratingHtml = '';
      // Show provider's rating if available
      if (skill.UserId) {
        try {
          const ratingRes = await fetch(`/api/ratings/${skill.UserId}`);
          const ratingData = await ratingRes.json();
          if (ratingData.total > 0) {
            ratingHtml = `<p><strong>Provider Rating:</strong> ⭐ ${ratingData.averageRating} (${ratingData.total})</p>`;
          } else {
            ratingHtml = `<p><strong>Provider Rating:</strong> No ratings yet</p>`;
          }
        } catch (e) {
          ratingHtml = '';
        }
      }
      card.innerHTML = `
        <h3>${skill.skillName}</h3>
        <p><strong>Type:</strong> ${skill.mode}</p>
        ${skill.price ? `<p><strong>Price:</strong> ₹${skill.price}</p>` : ""}
        ${skill.barterSkillWanted ? `<p><strong>Wants:</strong> ${skill.barterSkillWanted}</p>` : ""}
        <p>${skill.description}</p>
        ${ratingHtml}
        <button onclick="bookSkill('${skill.id}')">📩 Book</button>
      `;
      resultsContainer.appendChild(card);
    }
  }

  loadBookingRequests();
  loadMyBookings();
  // If provider, show provider chats
  if (document.getElementById("provider-chats")) {
    loadProviderChats();
  }
});

async function bookSkill(skillId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/bookings/book/${skillId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  alert(data.message || "📩 Booking sent!");
}

async function loadBookingRequests() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/bookings/requests", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const requests = await res.json();
  const list = document.getElementById("notification-list");
  list.innerHTML = "";

  requests.forEach((booking) => {
    const div = document.createElement("div");
    const skillName = booking.Skill?.skillName || "Unknown Skill";
    const requester = booking.User?.name || "Someone";

    div.innerHTML = `
      <p><strong>${requester}</strong> requested to learn <strong>${skillName}</strong></p>
      <button onclick="respondToBooking(${booking.id}, true)">✅ Accept</button>
      <button onclick="respondToBooking(${booking.id}, false)">❌ Reject</button>
      <hr />
    `;
    list.appendChild(div);
  });
}

async function respondToBooking(bookingId, accept) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/bookings/respond/${bookingId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: accept ? "accepted" : "rejected" })
  });
  const data = await res.json();
  alert(data.message || "Response sent");
  loadBookingRequests();
}

async function loadMyBookings() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/bookings/my", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const bookings = await res.json();
  const container = document.getElementById("my-bookings");
  container.innerHTML = "";
  bookings.forEach(b => {
    const div = document.createElement("div");
    div.className = "booking";
    div.innerHTML = `
      <strong>${b.Skill?.skillName || "Unknown Skill"}</strong> - Status: ${b.status}
      ${b.status === "accepted" && !b.isPaid ? `<button onclick=\"showPaymentModal(${b.id}, ${b.Skill?.price || 0})\">Pay</button>` : ""}
      ${b.status === "paid" ? `<a href=\"/chat.html?bookingId=${b.id}&user=${b.userId}\">Chat</a> <a href=\"/schedule.html?bookingId=${b.id}\">Schedule</a>` : ""}
    `;
    container.appendChild(div);
  });
}

const socket = io();
const userId = localStorage.getItem("userId");
if (userId) socket.emit("join", userId);
