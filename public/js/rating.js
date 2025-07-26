document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rating-form");
  const bookingId = new URLSearchParams(window.location.search).get("bookingId");
  const toUserId = new URLSearchParams(window.location.search).get("toUserId");
  const token = localStorage.getItem("token");
  const userInfoDiv = document.getElementById("rate-user-info");

  // Fetch and show the user being rated
  async function loadRatedUser() {
    if (!toUserId) return;
    try {
      const res = await fetch(`/api/profile/${toUserId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        userInfoDiv.innerHTML = `<strong>Rating user:</strong> ${user.name} (${user.email})`;
      } else {
        userInfoDiv.innerHTML = `<em>Could not load user info.</em>`;
      }
    } catch (err) {
      userInfoDiv.innerHTML = `<em>Could not load user info.</em>`;
    }
  }

  loadRatedUser();

  async function canRate(bookingId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/bookings/allow-rating/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = form.rating.value;
    const feedback = form.feedback.value;

    if (!(await canRate(bookingId))) {
      alert("Rating only allowed 24h after class completion.");
      return;
    }

    try {
      const res = await fetch(`/api/ratings/${toUserId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bookingId, rating, comment: feedback })
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Rating submitted!");
        window.location.href = "/dashboard.html";
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("❌ Network error");
    }
  });
});
