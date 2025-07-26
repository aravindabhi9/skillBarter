document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verify-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = form.otp.value;
    const email = localStorage.getItem("userEmail");

    if (!email) {
      alert("No signup email found. Please sign up again.");
      return (window.location.href = "/signup.html");
    }

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
        
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        alert("✅ OTP Verified. You can now login.");
        window.location.href = "/login.html";
      } else {
        alert("❌ Verification failed: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Network error occurred.");
    }
  });
});
