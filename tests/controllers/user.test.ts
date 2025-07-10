// tests/controllers/userController.test.js
const request = require("supertest");
const express = require("express");

// Mock your app setup
const app = express();
app.use(express.json());

// Mock user routes (adjust path as needed)
const userRoutes = require("../../src/routes/userRoutes");
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
});
