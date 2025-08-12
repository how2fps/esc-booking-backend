import { Request, Response } from "express";
import db from "../db";

export const confirmBookingPayment = async (req: Request, res: Response) => {
  const { bookingId, stripeSessionId } = req.body;

  if (!bookingId || !stripeSessionId) {
    return res.status(400).json({ error: "Missing required information." });
  }
  
  try {
    // This is the SQL query to update the booking status
    const sqlQuery = "UPDATE `bookings` SET `payment_status` = 'paid', `stripe_session_id` = ? WHERE `id` = ?";
    await db.execute(sqlQuery, [stripeSessionId, bookingId]);

    console.log(`Booking ${bookingId} successfully updated to 'paid' via polling confirmation.`);
    res.status(200).json({ success: true, message: "Booking confirmed." });

  } catch (error) {
    console.error("Failed to confirm booking payment:", error);
    res.status(500).json({ error: "Could not confirm booking." });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {

    const userId = Number(req.body.user_id ?? (req.session as any)?.user?.id);
    if (!userId) {
      return res.status(400).json({ error: "user_id is required (temporarily via body)" });
    }

    const {
      hotelName,
      roomType,
      numberOfNights,
      startDate,
      endDate,
      numAdults,
      numChildren,
      price,
      currency,
      firstName,
      lastName,
      phoneNumber,
      email,
      specialRequests
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO bookings (
        user_id,
        hotel_name, room_type, number_of_nights,
        start_date, end_date,
        num_adults, num_children, price, currency,
        first_name, last_name, phone_number, email,
        special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        hotelName,
        roomType,
        numberOfNights,
        startDate,
        endDate,
        numAdults,
        numChildren,
        price,
        currency,
        firstName,
        lastName,
        phoneNumber,
        email,
        specialRequests
      ]
    );

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: (result as any).insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};


