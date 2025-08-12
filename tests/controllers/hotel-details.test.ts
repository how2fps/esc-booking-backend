import express from "express";

import request from "supertest";
import hotelRoutes from "../../src/routes/hotelRoutes";
const app = express();
app.use(express.json());
app.use("/api/hotels", hotelRoutes);

describe("Hotel Controller - getHotelById", () => {
       describe("GET /api/hotels/:id", () => {
              it("returns hotel details by ID", async () => {
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

              it("returns 404 when non-existent hotel", async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: async () => ({}),
                } as Response);
                const response = await request(app).get("/api/hotels/INVALID_HOTEL_ID").expect(404);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Hotel not found");
            });

              it("handles valid hotel IDs from different destinations", async () => {
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

              it("returns hotel with required properties", async () => {
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

              it("handles malformed hotel IDs", async () => {
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


describe("Hotel Controller - getHotelPrices", () => {
    describe("GET /api/hotels/:id/prices", () => {
        
        describe("Input Validation Tests", () => {
            it("returns 404 for invalid hotel ID", async () => {
                const invalidIds = ["ABC", "12345", "ABCDE"];
                
                for (const hotelId of invalidIds) {
                    const response = await request(app)
                        .get(`/api/hotels/${hotelId}/prices`)
                        .query({
                            destination_id: "RsBU",
                            checkin: "2025-10-10",
                            checkout: "2025-10-17",
                            currency: "SGD",
                            country_code: "SG",
                            partner_id: "1089"
                        });
                    
                    expect(response.status).toBe(404);
                    expect(response.body).toHaveProperty("success", false);
                    expect(response.body).toHaveProperty("message", "Hotel not found");
                }
            });

            it("returns 404 for no hotel ID", async () => {
                const response = await request(app)
                    .get("/api/hotels//prices") // Empty hotel ID
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });
                
                expect(response.status).toBe(404);
            });

            it("returns 400 for missing required params", async () => {
                const requiredParams = [
                    "destination_id", "checkin", "checkout", 
                    "currency", "country_code", "partner_id"
                ];
                
                for (const missingParam of requiredParams) {
                    const params = {
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    };
                    
                    delete params[missingParam as keyof typeof params];
                    
                    const response = await request(app)
                        .get("/api/hotels/WD0M/prices")
                        .query(params);
                    
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("success", false);
                    expect(response.body.message).toContain("Missing required parameter");
                }
            });

            it("accepts valid hotel ID formats", async () => {
                const validIds = ["WD0M", "RsBU", "f5nJ", "A1B2"];
                
                const mockData = {
                    completed: true,
                    prices: [
                        {
                            price: 100.00,
                            currency: "SGD"
                        }
                    ]
                };

                for (const hotelId of validIds) {
                    global.fetch = jest.fn().mockResolvedValue({
                        ok: true,
                        json: async () => mockData,
                    } as Response);

                    const response = await request(app)
                        .get(`/api/hotels/${hotelId}/prices`)
                        .query({
                            destination_id: "RsBU",
                            checkin: "2025-10-10",
                            checkout: "2025-10-17",
                            currency: "SGD",
                            country_code: "SG",
                            partner_id: "1089"
                        });
                    
                    expect(response.status).toBe(200);
                    expect(response.body).toEqual(mockData);
                }
            });
        });

        describe("Successful Response Tests", () => {
            it("returns hotel prices when completed immediately", async () => {
                const mockData = {
                    completed: true,
                    prices: [
                        {
                            price: 150.75,
                            currency: "SGD"
                        }
                    ]
                };

                global.fetch = jest.fn().mockResolvedValue({
                    ok: true,
                    json: async () => mockData,
                } as Response);

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockData);
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            it("handles optional parameters correctly", async () => {
                const mockData = {
                    completed: true,
                    prices: [
                        {
                            price: 200.50,
                            currency: "USD"
                        }
                    ]
                };

                global.fetch = jest.fn().mockResolvedValue({
                    ok: true,
                    json: async () => mockData,
                } as Response);

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "USD",
                        country_code: "US",
                        partner_id: "1089",
                        guests: "2",
                        lang: "en_US"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockData);
                
                // Verify that optional parameters were included in the API call
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining("guests=2")
                );
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining("lang=en_US")
                );
            });
        });

        describe("Polling Mechanism Tests", () => {
            it("polls until completion", async () => {
                const incompletedData = {
                    completed: false,
                    search_id: "test-search-123"
                };

                const completedData = {
                    completed: true,
                    prices: [
                        {
                            price: 125.00,
                            currency: "SGD"
                        }
                    ]
                };

                global.fetch = jest.fn()
                    .mockResolvedValueOnce({
                        ok: true,
                        json: async () => incompletedData,
                    } as Response)
                    .mockResolvedValueOnce({
                        ok: true,
                        json: async () => completedData,
                    } as Response);

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toEqual(completedData);
                expect(global.fetch).toHaveBeenCalledTimes(2);
            }, 10000);
        });

        describe("Error Handling Tests", () => {
            it("returns 404 when external API returns 404", async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: async () => ({}),
                } as Response);

                const response = await request(app)
                    .get("/api/hotels/XXXX/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Hotel prices not found");
            });

            it("returns 500 when external API returns 500", async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: false,
                    status: 500,
                    json: async () => ({}),
                } as Response);

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Hotel prices not found");
            });

            it("handles network errors", async () => {
                global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(503);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Service temporarily unavailable");
            });

            it("handles malformed JSON response", async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: true,
                    json: async () => { throw new Error("Invalid JSON"); },
                } as unknown as Response);

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2025-10-10",
                        checkout: "2025-10-17",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Internal Server Error");
            });
        });

        describe("Edge Cases Tests", () => {
            it("handles different currency", async () => {
                const currencies = ["SGD", "USD", "EUR", "JPY"];
                
                for (const currency of currencies) {
                    const mockData = {
                        completed: true,
                        prices: [
                            {
                                price: 100.00,
                                currency: currency
                            }
                        ]
                    };

                    global.fetch = jest.fn().mockResolvedValue({
                        ok: true,
                        json: async () => mockData,
                    } as Response);

                    const response = await request(app)
                        .get("/api/hotels/WD0M/prices")
                        .query({
                            destination_id: "RsBU",
                            checkin: "2025-10-10",
                            checkout: "2025-10-17",
                            currency: currency,
                            country_code: "SG",
                            partner_id: "1089"
                        });

                    expect(response.status).toBe(200);
                    expect(response.body).toEqual(mockData);
                }
            });

            it("handles boundary date values", async () => {
                const mockData = {
                    completed: true,
                    prices: [
                        {
                            price: 75.50,
                            currency: "SGD"
                        }
                    ]
                };

                global.fetch = jest.fn().mockResolvedValue({
                    ok: true,
                    json: async () => mockData,
                } as Response);

                const response = await request(app)
                    .get("/api/hotels/WD0M/prices")
                    .query({
                        destination_id: "RsBU",
                        checkin: "2030-12-31",
                        checkout: "2031-01-01",
                        currency: "SGD",
                        country_code: "SG",
                        partner_id: "1089"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockData);
            });
        });
    });
});