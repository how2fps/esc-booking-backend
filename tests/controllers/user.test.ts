import express from "express";

import request from "supertest";
import pool from "../../src/db";
import userRoutes from "../../src/routes/userRoutes";

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("User Controller", () => {
       describe("GET /api/users", () => {
              it("should return all users", async () => {
                     const response = await request(app).get("/api/users").expect(200);
                     expect(response.body).toHaveProperty("success", true);
                     expect(response.body).toHaveProperty("data");
                     expect(Array.isArray(response.body.data)).toBe(true);
              });
       });

       describe("GET /api/users/:email", () => {
              it("should return Alice Johnson", async () => {
                     const response = await request(app).get("/api/users/alice.johnson@email.com").expect(200);
                     expect(response.body).toHaveProperty("success", true);
                     console.log(response.body);
                     expect(response.body).toHaveProperty("data");
                     expect(response.body.data[0]).toEqual({
                            id: expect.any(Number),
                            name: "Alice Johnson",
                            email: "alice.johnson@email.com",
                            phone_number: "+1-555-0101",
                            loyalty_points: 120,
                            created_at: expect.any(String),
                     });
              });
       });
});

afterAll(async () => {
       await pool.end();
});
