import express from "express";

import request from "supertest";
import hotelRoutes from "../../src/routes/hotelRoutes";
const app = express();
app.use(express.json());
app.use("/api/hotels", hotelRoutes);

//hotelapi.loyalty.dev/api/hotels/:id
describe("Hotel Controller - getHotelById", () => {
       describe("GET /api/hotels/:id", () => {
              it("should return hotel details by ID", async () => {
                     // Mock fetch for this test
                     global.fetch = jest.fn().mockResolvedValue({
                         ok: true,
                         json: async () => ({
                             id: "WD0M",
                             name: "Test Hotel",
                             description: "A test hotel",
                             rating: 4.5,
                             latitude: 1.2345,
                             longitude: 103.6789,
                             address: "123 Test Street",
                             amenities: ["WiFi", "Pool"]
                         }),
                     } as Response);
                     const response = await request(app).get("/api/hotels/WD0M").expect(200);
                     expect(response.body).toHaveProperty("id");
                     expect(response.body).toHaveProperty("name");
                     expect(response.body).toHaveProperty("description");
                     expect(response.body).toHaveProperty("rating");
                     expect(response.body).toHaveProperty("latitude");
                     expect(response.body).toHaveProperty("longitude");
                     expect(response.body).toHaveProperty("address");
                     expect(response.body).toHaveProperty("amenities");
                     expect(Array.isArray(response.body.amenities)).toBe(true);
              });

              it("should return 404 for non-existent hotel", async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: async () => ({}),
                } as Response);
                const response = await request(app).get("/api/hotels/INVALID_HOTEL_ID").expect(404);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Hotel not found");
            });

              it("should handle valid hotel IDs from different destinations", async () => {
                     const hotelIds = ["WD0M", "RsBU", "f5nJ"];
                     for (const hotelId of hotelIds) {
                         global.fetch = jest.fn().mockResolvedValue({
                             ok: true,
                             json: async () => ({
                                 id: hotelId,
                                 name: `Hotel ${hotelId}`,
                                 description: "A test hotel",
                                 rating: 4.5,
                                 latitude: 1.2345,
                                 longitude: 103.6789,
                                 address: "123 Test Street",
                                 amenities: ["WiFi", "Pool"]
                             }),
                         } as Response);
                         const response = await request(app).get(`/api/hotels/${hotelId}`);
                         expect(response.status).toBe(200);
                         expect(response.body).toHaveProperty("id");
                         expect(response.body).toHaveProperty("name");
                         expect(typeof response.body.name).toBe("string");
                         expect(response.body.name.length).toBeGreaterThan(0);
                     }
              });

              it("should return hotel with required properties", async () => {
                     global.fetch = jest.fn().mockResolvedValue({
                         ok: true,
                         json: async () => ({
                             id: "WD0M",
                             name: "Test Hotel",
                             latitude: 1.2345,
                             longitude: 103.6789
                         }),
                     } as Response);
                     const response = await request(app).get("/api/hotels/WD0M");
                     expect(response.status).toBe(200);
                     expect(response.body).toHaveProperty("id");
                     expect(response.body).toHaveProperty("name");
                     expect(response.body).toHaveProperty("latitude");
                     expect(response.body).toHaveProperty("longitude");
                     expect(typeof response.body.latitude).toBe("number");
                     expect(typeof response.body.longitude).toBe("number");
              });

              it("should handle malformed hotel IDs", async () => {
                const malformedIds = ["@#$%", "Gt 7"];
                for (const hotelId of malformedIds) {
                    process.stdout.write("Testing malformed hotelId: " + hotelId + "\n");
                    global.fetch = jest.fn().mockResolvedValue({
                        ok: false,
                        status: 404,
                        json: async () => ({}),
                    } as Response);
                    const response = await request(app).get(`/api/hotels/${encodeURIComponent(hotelId)}`);
                    expect(response.status).toBe(404);
                    expect(response.body).toHaveProperty("success", false);
                    expect(response.body).toHaveProperty("message", "Hotel not found");
                }
            });
       });
});