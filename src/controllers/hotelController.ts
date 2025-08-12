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

//api/hotels/prices?destination_id={}&checkin={yyyy-mm-dd}&checkout={yyyy-mm-dd}&lang={en_US}&currency={SGD}&country_code={SG}&guests={2}&partner_id={1}
// export const pollAllHotelPrices = async (req: Request, res: Response): Promise<void> => {
//        try {
//               const maxRetries = 40;
//               let tries = 0;
//               const queryString = new URLSearchParams(req.query as any).toString();
//               console.log(queryString);

//               while (tries < maxRetries) {
//                      try {
//                             const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/prices?${queryString}`);
//                             const data = await response.json();
//                             console.log(data);
//                             if (data && data.completed) {
//                                    res.status(200).json({ complete: true, data });
//                                    return;
//                             }
//                             tries++;
//                             await sleep(2000);
//                      } catch (error) {
//                             console.log(error);
//                      }
//               }
//               res.status(504).json({ complete: false, message: "Timeout waiting for price data" });
//        } catch (error) {
//               console.log(error);
//               res.status(500).json({ error: "Internal Server Error" });
//        }
// };

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

  export const getHotelPrices = async (req: Request, res: Response): Promise<void> => {
    const { id: hotelId } = req.params;

    const requiredParams = ['destination_id', 'checkin', 'checkout', 'currency', 'country_code', 'partner_id'];
    const optionalParams = ['lang', 'guests', 'landing_page', 'product_type'];

    const defaultValues: Record<string, string> = {
      lang: 'en_US',
      guests: '2',
    };

    const validIdPattern = /^[a-zA-Z0-9]{4}$/;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    try {
      // Validate hotel ID
      if (!hotelId || !validIdPattern.test(hotelId)) {
        res.status(404).json({ success: false, message: "Hotel not found" });
        return;
      }

      const queryParams = new URLSearchParams();

      // Check required query params
      for (const param of requiredParams) {
        const value = req.query[param] as string;
        if (!value) {
          res.status(400).json({
            success: false,
            message: `Missing required parameter: ${param}`,
          });
          return;
        }

        if ((param === 'checkin' || param === 'checkout') && !datePattern.test(value)) {
          res.status(400).json({
            success: false,
            message: "Invalid date format. Use YYYY-MM-DD",
          });
          return;
        }

        queryParams.append(param, value);
      }

      // Set optional params (with defaults if missing)
      for (const param of optionalParams) {
        const value = (req.query[param] as string) ?? defaultValues[param];
        if (value) queryParams.append(param, value);
      }

      const apiUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}/price?${queryParams.toString()}`;
      
      // Polling configuration
      const maxRetries = 40;
      const pollInterval = 2000; // 2 seconds
      let attempts = 0;

      while (attempts < maxRetries) {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const status = [500, 503].includes(response.status) ? response.status : 404;
          res.status(status).json({ success: false, message: "Hotel prices not found" });
          return;
        }

        const data = await response.json();
        console.log("Polling data:", data);
        console.log(data);

        if (!data || typeof data !== 'object') {
          res.status(404).json({ success: false, message: "Hotel prices not found" });
          return;
        }

        // Check if the search is completed
        if (data.completed === true) {
          res.status(200).json(data);
          return;
        }

        // If not completed, increment attempts and wait before next pollfl
        attempts++;
        
        // If we've reached max retries, return timeout
        if (attempts >= maxRetries) {
          res.status(504).json({ 
            success: false, 
            message: "Timeout waiting for price data",
            completed: false 
          });
          return;
        }

        // Wait before next poll
        await sleep(pollInterval);
      }

    } catch (error: any) {
      const message = error?.message?.toLowerCase() ?? '';

      if (
        message.includes("network error") ||
        message.includes("failed to fetch") ||
        message.includes("timeout")
      ) {
        res.status(503).json({ success: false, message: "Service temporarily unavailable" });
        return;
      }

      console.error("Error getting hotel prices:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
      return;
    }
  };