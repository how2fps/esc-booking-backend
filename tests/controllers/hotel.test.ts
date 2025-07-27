import express from "express";

import request from "supertest";
import hotelRoutes from "../../src/routes/hotelRoutes";
const app = express();
app.use(express.json());
app.use("/api/hotels", hotelRoutes);

//hotelapi.loyalty.dev/api/hotels/prices?destination_id=WD0M&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1

describe("GET /api/hotels", () => {
       it("should return hotels without prices", async () => {
              const response = await request(app).get("/api/hotels?destination_id=WD0M&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1").expect(200);
              expect(Array.isArray(response.body)).toBe(true);
              expect(response.body.length).toBeGreaterThan(0);
              expect(response.body[0]).toHaveProperty("id");
              expect(response.body[0]).toHaveProperty("name");
              expect(response.body[0]).toHaveProperty("categories");
              expect(response.body[0]).toHaveProperty("rating");
              expect(response.body[0]).toHaveProperty("latitude");
              expect(response.body[0]).toHaveProperty("longitude");
       });

       it("should return 400 if destination_id is missing", async () => {
              const response = await request(app).get("/api/hotels?checkin=2025-10-01&checkout=2025-10-07");
              expect(response.status).toBe(400);
       });

       it("should return 400 if checkin/checkout dates are malformed", async () => {
              const response = await request(app).get("/api/hotels?destination_id=WD0M&checkin=invalid-date&checkout=wrong");
              expect(response.status).toBe(400);
       });
});

describe("GET /api/hotels/prices", () => {
       it("should poll hotel prices until complete or timeout", async () => {
              const maxAttempts = 40;
              const interval = 2000;
              let attempts = 0;
              let completed = false;
              let response;

              while (attempts < maxAttempts && !completed) {
                     response = await request(app).get("/api/hotels/prices").query({
                            destination_id: "WD0M",
                            checkin: "2025-10-01",
                            checkout: "2025-10-07",
                            lang: "en_US",
                            currency: "SGD",
                            country_code: "SG",
                            guests: 2,
                            partner_id: 1,
                     });

                     if (response.status === 200 && response.body.data?.completed) {
                            completed = true;
                            break;
                     }

                     attempts++;
                     await new Promise((res) => setTimeout(res, interval));
              }

              expect(completed).toBe(true);
              expect(response).toBeDefined();
              expect(response?.body?.data).toHaveProperty("hotels");
              expect(Array.isArray(response?.body?.data?.hotels)).toBe(true);
       }, 100000);
});
