document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const container = document.getElementById("skills-container");

  async function fetchSkills() {
    try {
      const res = await fetch("/api/skills/mine", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const skills = await res.json();
      container.innerHTML = "";

      if (!skills.length) {
        container.innerHTML = "<p>No skills posted yet.</p>";
        return;
      }

      skills.forEach(skill => {
        const card = document.createElement("div");
        card.className = "skill-card";
        card.innerHTML = `
          <h3>${skill.skillName}</h3>
          <p><strong>Type:</strong> ${skill.mode}</p>
          <p><strong>Description:</strong> ${skill.description}</p>
          ${skill.price ? `<p><strong>Price:</strong> ₹${skill.price}</p>` : ""}
          ${skill.barterSkillWanted ? `<p><strong>Wants:</strong> ${skill.barterSkillWanted}</p>` : ""}
          <button onclick="editSkill(${skill.id})">✏️ Edit</button>
          <button onclick="deleteSkill(${skill.id})">🗑️ Delete</button>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("❌ Error loading skills:", err);
      container.innerHTML = "<p>Failed to load skills.</p>";
    }
  }

  window.deleteSkill = async function (id) {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      const res = await fetch(`/api/skills/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      alert(data.message || "Skill deleted");
      fetchSkills();
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  window.editSkill = function (id) {
    localStorage.setItem("editSkillId", id);
    window.location.href = "/add-skill.html"; // Prefill logic will be added in add-skill.js
  };

  fetchSkills();
});
