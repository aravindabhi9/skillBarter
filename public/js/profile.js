document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const token = localStorage.getItem("token");
  const ratingDiv = document.getElementById("profile-rating");

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        form.name.value = data.name || "";
        form.email.value = data.email || "";
        form.phone.value = data.phone || "";
        form.whatsapp.value = data.whatsapp || "";
        // Fetch and show rating
        if (data.id) {
          const ratingRes = await fetch(`/api/ratings/${data.id}`);
          const ratingData = await ratingRes.json();
          if (ratingData.total > 0) {
            ratingDiv.innerHTML = `<strong>⭐ Rating:</strong> ${ratingData.averageRating} (${ratingData.total} rating${ratingData.total > 1 ? 's' : ''})`;
          } else {
            ratingDiv.innerHTML = `<strong>⭐ Rating:</strong> No ratings yet`;
          }
        }
      } else {
        alert("❌ Failed to load profile");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Network error");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value,
      phone: form.phone.value,
      whatsapp: form.whatsapp.value,
    };

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Profile updated successfully!");
        loadProfile();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating profile");
    }
  });

  loadProfile();
});
