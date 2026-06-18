require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const sendBookingEmail = require("./emailserver");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static(__dirname));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch(console.error);

const Booking = mongoose.model(
  "Booking",
  new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    court: String,
    status: { type: String, default: "RESERVED" },
    createdAt: { type: Date, default: Date.now },
  })
);

app.get("/", (req, res) => res.send("Server Running 🚀"));

app.post("/book", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, email, phone, date, slots } = req.body;

    const parsed = JSON.parse(slots || "[]");

    if (!name || !email || !phone || !date || !parsed.length) {
      return res.status(400).json({ success: false });
    }

    for (const s of parsed) {
      await Booking.create({
        name,
        email,
        phone,
        date,
        time: s.time,
        court: s.court,
      });

      await sendBookingEmail(email, {
        name,
        date,
        time: s.time,
        court: s.court,
        screenshot: req.file?.path,
      });
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.get("/bookings", async (_, res) => {
  try {
    const data = await Booking.find();

    const grouped = {};

    data.forEach((b) => {
      grouped[b.date] ??= {};
      grouped[b.date][`${b.time}-${b.court}`] = {
        name: b.name,
        createdAt: b.createdAt,
      };
    });

    res.json(grouped);
  } catch {
    res.status(500).json({ success: false });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running ✔")
);
