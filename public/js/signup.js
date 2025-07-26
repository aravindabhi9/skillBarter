document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const whatsapp = form.whatsapp.value;
    const password = form.password.value;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, whatsapp, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userEmail", email);
        alert("✅ OTP sent to your email!");
        window.location.href = "/verify.html";
      } else {
        alert("❌ Signup failed: " + data.message);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error occurred.");
    }
  });
});
