document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-skill-form");
  const mode = document.getElementById("mode");
  const priceGroup = document.getElementById("price-group");
  const barterGroup = document.getElementById("barter-group");

  mode.addEventListener("change", () => {
    priceGroup.style.display = mode.value === "paid" ? "block" : "none";
    barterGroup.style.display = mode.value === "barter" ? "block" : "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const body = {
      skillName: form.skillName.value,
      description: form.description.value,
      mode: form.mode.value,
      price: form.price.value || null,
      barterSkillWanted: form.barterSkillWanted.value || null
    };

    try {
      const res = await fetch("/api/skills/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Skill added!");
        form.reset();
        priceGroup.style.display = "none";
        barterGroup.style.display = "none";
      } else {
        alert("❌ Failed: " + data.message);
      }
    } catch (err) {
      console.error("Skill add error:", err);
      alert("❌ Network error");
    }
  });
});
