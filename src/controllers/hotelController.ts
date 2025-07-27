import { Request, Response } from "express";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// destination_id
// RsBU
// checkin
// 2025-7-23
// checkout
// 2025-7-30
// lang
// en_US
// currency
// SGD
// country_code
// SG
// guests
// 2
// partner_id
// 1
//api/hotels?destination_id=RsBU
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
       try {
              const { destination_id, checkin, checkout, lang, currency, country_code, guests, partner_id } = req.query;
              if (!destination_id) {
                     res.status(400).json({
                            message: "Missing destination_id",
                     });
                     return;
              }
              if (checkin && isNaN(Date.parse(checkin as string))) {
                     res.status(400).json({
                            message: "Invalid checkin format",
                     });
                     return;
              }
              if (checkout && isNaN(Date.parse(checkout as string))) {
                     res.status(400).json({
                            message: "Invalid checkout format",
                     });
                     return;
              }
              const queryString = `destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=${lang}&currency=${currency}&country_code=${country_code}&guests=${guests}&partner_id=${partner_id}`;
              const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels?${queryString}`);
              if (!response.ok) {
                     res.status(response.status).json({
                            success: false,
                            message: `${response.statusText}`,
                     });
                     return;
              }

              const data = await response.json();

              if (!Array.isArray(data) || data.length === 0) {
                     res.status(404).json({
                            success: false,
                            message: "No hotels found",
                     });
                     return;
              }

              res.status(200).json(data);
       } catch (error) {
              console.error("Error getting hotels:", error);
              res.status(500).json({
                     success: false,
                     message: "Internal server error while getting hotels",
              });
       }
};
//api/hotels/prices?destination_id=RsBU&checkin=2025-7-23&checkout=2025-7-30&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1
//api/hotels/prices?destination_id={}&checkin={yyyy-mm-dd}&checkout={yyyy-mm-dd}&lang={en_US}&currency={SGD}&country_code={SG}&guests={2}&partner_id={1}
export const pollAllHotelPrices = async (req: Request, res: Response): Promise<void> => {
       //doesnt actually poll anymore, handling in frontend, will change name in the future
       try {
              const { destination_id, checkin, checkout, lang, currency, country_code, guests, partner_id } = req.query;
              if (!destination_id) {
                     res.status(400).json({
                            message: "Missing destination_id",
                     });
                     return;
              }
              if (checkin && isNaN(Date.parse(checkin as string))) {
                     res.status(400).json({
                            message: "Invalid checkin date format",
                     });
                     return;
              }
              if (checkout && isNaN(Date.parse(checkout as string))) {
                     res.status(400).json({
                            message: "Invalid checkout date format",
                     });
                     return;
              }
              const queryString = `destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=${lang}&currency=${currency}&country_code=${country_code}&guests=${guests}&partner_id=${partner_id}`;
              try {
                     const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/prices?${queryString}`);
                     const contentType = response.headers.get("content-type");
                     if (!contentType || !contentType.includes("application/json")) {
                            const text = await response.text();
                            throw new Error(`Expected JSON but got: ${text.slice(0, 100)}...`);
                     }
                     const data = await response.json();
                     if (data && data.completed) {
                            res.status(200).json({ complete: true, data });
                            return;
                     }
                     await sleep(2000);
              } catch (error) {
                     console.log(error);
              }

              res.status(504).json({ complete: false, message: "Timeout waiting for price data" });
       } catch (error) {
              console.log(error);
              res.status(500).json({ error: "Internal Server Error" });
       }
};

export const getHotelById = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotelId = req.params.id;
        const validIdPattern = /^[a-zA-Z0-9]{4}$/;
        // Check for undefined, null, empty string, or invalid format
        if (!hotelId || typeof hotelId !== "string" || hotelId.trim() === "" || !validIdPattern.test(hotelId)) {
            res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
            return;
        }
        const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/${hotelId}`);
        if (!response.ok) {
            // If external API returns 500, propagate as 500
            const status = response.status === 500 ? 500 : 404;
            res.status(status).json({
                success: false,
                message: "Hotel not found",
            });
            return;
        }
        const data = await response.json();
        // If data is empty or missing required fields, treat as not found
        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            !data.id ||
            !data.name
        ) {
            res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
            return;
        }
        res.status(200).json(data);
    } catch (error: any) {
        // If error is a network error or fetch throws, treat as not found
        if (
            error?.message === "Hotel not found" ||
            error?.message?.toLowerCase().includes("network error") ||
            error?.message?.toLowerCase().includes("failed to fetch") ||
            error?.message?.toLowerCase().includes("complete system failure")
        ) {
            res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
        } else {
            console.error("Error getting hotel by ID:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }
}