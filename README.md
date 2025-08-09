# Skill Barter Platform

A peer-to-peer skill exchange and booking platform where users can:
- Post skills as **Free**, **Paid**, or **Barter**.
- Search and book skills.
- Negotiate through chat.
- Receive notifications for bookings.
- Update profile with newly learned skills.

## 🚀 Features
- **User Authentication** – JWT-based authentication.
- **Skill Posting** – Free / Paid / Barter options with skill matching.
- **Booking Requests** – Accept / Reject with notifications.
- **Profile Updates** – Mark skills as learned.
- **Payments** – Razorpay integration for paid skills.
- **Real-time Messaging** – Socket.io integration for chat.
- **Email Notifications** – Contact details shared on booking approval.
## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via Sequelize ORM)
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT
- **Payments**: Razorpay

- **Real-time**: Socket.io
- **Email Service**: SendinBlue

## 📂 Project Structure
project-root/
│
├── controllers/ # Controllers for handling requests
├── models/ # Sequelize models
├── routes/ # API routes
├── public/ # Static frontend files
├── views/ # HTML pages
├── app.js # Main server file
├── README.md # Project documentation
└── package.json # Dependencies and scripts

## ⚙️ Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/aravindabhi9/skill-barter.git
Configure environment variables in .env:
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=skill_barter
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
SENDINBLUE_API_KEY=your_api_key
