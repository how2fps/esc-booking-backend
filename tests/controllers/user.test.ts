import express from "express";

import request from "supertest";
import { default as db, default as pool } from "../../src/db";
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

       describe("POST /api/users/signup", () => {
              const testUser = {
                     name: "Test User",
                     email: "test@example.com",
                     password: "securePassword123",
                     phone_number: "99999999",
              };

              beforeAll(async () => {
                     await db.execute("DELETE FROM users WHERE email = ?", [testUser.email]);
              });

              afterAll(async () => {
                     await db.execute("DELETE FROM users WHERE email = ?", [testUser.email]);
              });

              it("should sign up a new user", async () => {
                     const res = await request(app).post("/api/users/signup").send(testUser).expect(201);
                     expect(res.body).toHaveProperty("success", true);
                     expect(res.body.data).toHaveProperty("id");
                     expect(res.body.data).toMatchObject({
                            id: expect.any(Number),
                            name: testUser.name,
                            email: testUser.email,
                            phone_number: testUser.phone_number,
                            loyalty_points: 0,
                     });
              });
              it("should not allow duplicate email sign-up", async () => {
                     const res = await request(app).post("/api/users/signup").send(testUser).expect(409);
                     expect(res.body).toHaveProperty("success", false);
                     expect(res.body).toHaveProperty("message", "Email already in use");
              });
       });
});

afterAll(async () => {
       await pool.end();
});
