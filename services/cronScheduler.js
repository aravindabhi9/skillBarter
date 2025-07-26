const cron = require("node-cron");
const { Booking, Rating, User } = require("../models");

// This cron runs every 5 minutes to mark classes as done and send WhatsApp/rating emails
const sendEmail = require("../utils/sendEmail");
const { Skill } = require("../models");
cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running scheduled class completion check...");
  try {
    const now = new Date();
    // Find all scheduled classes whose time has passed and are not yet marked done
    const dueBookings = await Booking.findAll({
      where: {
        status: "scheduled"
      },
      include: [
        { model: require("../models").User, as: "Learner" },
        { model: require("../models").User, as: "Provider" },
        Skill
      ]
    });
    for (const booking of dueBookings) {
      const classDateTime = new Date(`${booking.classDate}T${booking.classTime}`);
      if (now >= classDateTime) {
        booking.status = "done";
        await booking.save();
        // Send WhatsApp contacts, thank you, and rating link to both users
        const learner = booking.Learner;
        const provider = booking.Provider;
        const learnerWhatsapp = learner.whatsappNumber || learner.whatsapp || learner.phone || "Not provided";
        const providerWhatsapp = provider.whatsappNumber || provider.whatsapp || provider.phone || "Not provided";
        const skillName = booking.Skill?.skillName || "the skill";
        // Rating links
        const learnerRatingLink = `${process.env.BASE_URL || "http://localhost:3000"}/rating.html?bookingId=${booking.id}&toUserId=${provider.id}`;
        const providerRatingLink = `${process.env.BASE_URL || "http://localhost:3000"}/rating.html?bookingId=${booking.id}&toUserId=${learner.id}`;
        // Email bodies
        const learnerMsg = `Thank you for attending your class for ${skillName}!\n\nYou can contact your provider for doubts via WhatsApp: ${providerWhatsapp}.\n\nPlease rate your experience: ${learnerRatingLink}`;
        const providerMsg = `Thank you for teaching your class for ${skillName}!\n\nYou can contact your learner for doubts via WhatsApp: ${learnerWhatsapp}.\n\nPlease rate your experience: ${providerRatingLink}`;
        await sendEmail(learner.email, "Class Completed! WhatsApp & Rating", learnerMsg);
        await sendEmail(provider.email, "Class Completed! WhatsApp & Rating", providerMsg);
        console.log(`✅ Booking ${booking.id} marked as done and emails sent.`);
      }
    }
  } catch (err) {
    console.error("❌ Cron error:", err);
  }
});
