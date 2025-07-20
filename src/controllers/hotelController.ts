import { Request, Response } from "express";

export const getAllHotels = async (req: Request, res: Response) => {
       try {
              const queryString = new URLSearchParams(req.query as any).toString();
              const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels?${queryString}`);
              const data = await response.json();
              res.status(200).json(data);
       } catch (error) {
              console.error("Error getting hotels:", error);
              res.status(500).json({
                     success: false,
                     message: "Error getting hotels",
              });
       }
};
