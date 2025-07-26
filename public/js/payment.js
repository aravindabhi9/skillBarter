document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("payment-form");
  const bookingIdField = document.getElementById("bookingId");
  const amountField = document.getElementById("amount");

  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("bookingId");
  const amount = params.get("amount");

  bookingIdField.value = bookingId;
  amountField.value = amount;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bookingId, amount })
      });

      const data = await res.json();

      if (res.ok && data.razorpayOrderId) {
        // Launch Razorpay checkout
        const options = {
          key: data.razorpayKey,
          amount: data.amount,
          currency: "INR",
          name: "Skill Barter",
          description: `Payment for booking #${bookingId}`,
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            // Notify backend to unlock chat
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/bookings/pay/${bookingId}`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ paymentId: response.razorpay_payment_id })
            });
            const data = await res.json();
            if (res.ok) {
              alert("✅ Payment successful! Chat unlocked.");
              window.location.href = "/dashboard.html";
            } else {
              alert("❌ Payment failed: " + data.message);
            }
          }
        };

        const razor = new Razorpay(options);
        razor.open();
      } else {
        alert("❌ Payment failed: " + data.message);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Network error");
    }
  });
});
