import { Request, Response } from "express";
const isSafeAlphaNum = (val: unknown): val is string => typeof val === "string" && /^[a-zA-Z0-9_-]+$/.test(val);
const isDateString = (val: unknown): val is string => typeof val === "string" && !isNaN(Date.parse(val));
const isPositiveInteger = (val: unknown): val is string => typeof val === "string" && /^\d+$/.test(val);
const isValidGuestFormat = (guests: unknown): boolean => {
       if (typeof guests === "string") {
              if (!guests) return false;
              const parts = guests.split("|");
              return parts.every((part) => /^\d+$/.test(part) && Number(part) > 0);
       }
       return false;
};
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
       try {
              const { destination_id } = req.query;
              if (!destination_id) {
                     return void res.status(400).json({
                            message: "Missing destination_id",
                     });
              }
              if (!isSafeAlphaNum(destination_id)) {
                     return void res.status(400).json({ message: "Invalid destination_id" });
              }
              const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels?destination_id=${encodeURIComponent(destination_id)}`);
              if (!response.ok) {
                     return void res.status(response.status).json({
                            success: false,
                            message: `${response.statusText}`,
                     });
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
              res.status(500).json({
                     success: false,
                     message: "Internal server error while getting hotels",
              });
       }
};

export const pollAllHotelPrices = async (req: Request, res: Response): Promise<void> => {
       try {
              const { destination_id, checkin, checkout, lang, currency, country_code, guests, landing_page, product_type, partner_id } = req.query;
              if (!destination_id) {
                     return void res.status(400).json({
                            message: "Missing destination_id",
                     });
              }
              if (!isSafeAlphaNum(destination_id)) {
                     return void res.status(400).json({ message: "Invalid destination_id" });
              }
              if (!isDateString(checkin)) {
                     return void res.status(400).json({ message: "Invalid checkin date format" });
              }
              if (!isDateString(checkout)) {
                     return void res.status(400).json({ message: "Invalid checkout date format" });
              }
              if (!isValidGuestFormat(guests)) {
                     return void res.status(400).json({ message: "Invalid guests format" });
              }
              if (landing_page && !isSafeAlphaNum(landing_page)) {
                     return void res.status(400).json({ message: "Invalid landing_page format" });
              }
              if (product_type && !isSafeAlphaNum(product_type)) {
                     return void res.status(400).json({ message: "Invalid product_type format" });
              }
              if (partner_id && !isSafeAlphaNum(partner_id)) {
                     return void res.status(400).json({ message: "Invalid partner_id format" });
              }
              const queryString = new URLSearchParams({
                     destination_id: destination_id as string,
                     ...(checkin ? { checkin: checkin as string } : {}),
                     ...(checkout ? { checkout: checkout as string } : {}),
                     ...(lang ? { lang: lang as string } : {}),
                     ...(currency ? { currency: currency as string } : {}),
                     ...(country_code ? { country_code: country_code as string } : {}),
                     ...(guests ? { guests: guests as string } : {}),
                     ...(partner_id ? { partner_id: partner_id as string } : {}),
                     ...(landing_page ? { landing_page: landing_page as string } : {}),
                     ...(product_type ? { product_type: product_type as string } : {}),
              }).toString();
              const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/prices?${queryString}`);
              const contentType = response.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                     const text = await response.text();
                     throw new Error(`Expected JSON but got: ${text.slice(0, 100)}...`);
              }
              const data = await response.json();
              return void res.status(200).json(data);
       } catch (error) {
              return void res.status(500).json({ error: "Internal Server Error" });
       }
};

export const getHotelById = async (req: Request, res: Response): Promise<void> => {
       try {
              const hotelId = req.params.id;
              const validIdPattern = /^[a-zA-Z0-9]{4}$/;
              if (!hotelId || typeof hotelId !== "string" || hotelId.trim() === "" || !validIdPattern.test(hotelId)) {
                     res.status(404).json({
                            success: false,
                            message: "Hotel not found",
                     });
                     return;
              }
              const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/${hotelId}`);
              if (!response.ok) {
                     const status = response.status === 500 ? 500 : 404;
                     res.status(status).json({
                            success: false,
                            message: "Hotel not found",
                     });
                     return;
              }
              const data = await response.json();
              if (!data || typeof data !== "object" || Array.isArray(data) || !data.id || !data.name) {
                     res.status(404).json({
                            success: false,
                            message: "Hotel not found",
                     });
                     return;
              }
              res.status(200).json(data);
       } catch (error: any) {
              if (error?.message === "Hotel not found" || error?.message?.toLowerCase().includes("network error") || error?.message?.toLowerCase().includes("failed to fetch") || error?.message?.toLowerCase().includes("complete system failure")) {
                     res.status(404).json({
                            success: false,
                            message: "Hotel not found",
                     });
              } else {
                     res.status(500).json({
                            success: false,
                            message: "Internal Server Error",
                     });
              }
       }
};
