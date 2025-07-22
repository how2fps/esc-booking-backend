import { Request, Response } from "express";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//api/hotels?destination_id=RsBU
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
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

//api/hotels/prices?destination_id=RsBU&checkin=2025-7-23&checkout=2025-7-30&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1
//api/hotels/prices?destination_id={}&checkin={yyyy-mm-dd}&checkout={yyyy-mm-dd}&lang={en_US}&currency={SGD}&country_code={SG}&guests={2}&partner_id={1}
export const pollAllHotelPrices = async (req: Request, res: Response): Promise<void> => {
       try {
              const maxRetries = 40;
              let tries = 0;
              const queryString = new URLSearchParams(req.query as any).toString();
              console.log(queryString);

              while (tries < maxRetries) {
                     try {
                            const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/prices?${queryString}`);
                            const data = await response.json();
                            console.log(data);
                            if (data && data.completed) {
                                   res.status(200).json({ complete: true, data });
                                   return;
                            }
                            tries++;
                            await sleep(2000);
                     } catch (error) {
                            console.log(error);
                     }
              }
              res.status(504).json({ complete: false, message: "Timeout waiting for price data" });
       } catch (error) {
              console.log(error);
              res.status(500).json({ error: "Internal Server Error" });
       }
};
