import request from "supertest"
import { describe, expect, it} from "vitest";
import { app } from "../src/app.js";
import { response } from "express";



describe("GET /health/live", () => {
    it("should returns http 200 with the health status", async () => {
        const response = await request(app).get("/health/live").expect("Content-Type", /json/).expect(200)

        expect(response.body).toEqual({status: "ok"})
    })
})