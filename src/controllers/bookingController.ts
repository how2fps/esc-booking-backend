import { Request, Response } from "express";
import db from "../db";

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
        num_adults, num_children, price,
        first_name, last_name, phone_number, email,
        special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
