import express from "express";
import request from "supertest";
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
});
