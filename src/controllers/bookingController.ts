import { Request, Response } from "express";
import db from "../db";

export const createBooking = async (req: Request, res: Response) => {
  try {
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
        hotel_name, room_type, number_of_nights,
        start_date, end_date,
        num_adults, num_children, price,
        first_name, last_name, phone_number, email,
        special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
