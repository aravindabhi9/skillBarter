// DOM-based schedule form handling for schedule.html
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("schedule-form");
  const statusDiv = document.getElementById("schedule-status");
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("bookingId");
  const token = localStorage.getItem("token");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = form.date.value;
    const time = form.time.value;
    try {
      const res = await fetch(`/api/bookings/schedule/${bookingId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date, time })
      });
      const data = await res.json();
      if (res.ok) {
        statusDiv.textContent = "Schedule updated!";
      } else {
        statusDiv.textContent = data.message || "Failed to update schedule.";
      }
    } catch (err) {
      statusDiv.textContent = "Network error.";
    }
  });
});
// schedule.js - Scheduling and rescheduling logic

async function scheduleClass(bookingId, date, time) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/bookings/schedule/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ date, time })
  });
  const data = await res.json();
  if (res.ok) {
    alert('✅ Class scheduled!');
  } else {
    alert('❌ ' + data.message);
  }
}

async function rescheduleClass(bookingId, date, time) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/bookings/reschedule/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ date, time })
  });
  const data = await res.json();
  if (res.ok) {
    alert('✅ Meeting rescheduled!');
  } else {
    alert('❌ ' + data.message);
  }
}

// Usage: scheduleClass(bookingId, date, time); rescheduleClass(bookingId, date, time);
// Only show reschedule button if >6 hours before class (check in UI)
