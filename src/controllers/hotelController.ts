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

export const pollAllHotelPrices = async (req: Request, res: Response) => {
       try {
              const maxRetries = 10;
              let tries = 0;
              const interval = 3000;
              const queryString = new URLSearchParams(req.query as any).toString();
              const poll = async () => {
                     try {
                            const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/prices?${queryString}`);
                            const data = await response.json();
                            console.log(data);
                            if (data && data.length > 0) {
                                   return res.status(200).json({ complete: true, data });
                            }
                            tries++;
                            if (tries < maxRetries) {
                                   setTimeout(poll, interval);
                            } else {
                                   res.status(504).json({ complete: false, message: "Timeout waiting for price data" });
                            }
                     } catch (error) {
                            console.error("Polling error:", error);
                            res.status(500).json({ error: "Internal Server Error during polling" });
                     }
              };

              poll();
       } catch (error) {}
};
