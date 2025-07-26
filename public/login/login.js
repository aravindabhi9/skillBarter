document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);  // Add this line
      window.location.href = "/dashboard";
    } else {
      document.getElementById("message").textContent = data.message || "Login failed";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").textContent = "Something went wrong";
  }
});
