document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId); // correct
        localStorage.setItem("userEmail", data.name); // this is storing name, not email
        alert("✅ Login successful!");
        window.location.href = "/dashboard.html";
      } else {
        alert("❌ Login failed: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Network error occurred.");
    }
  });
});
