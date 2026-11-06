import { toNodeHandler } from "better-auth/node";
import { Router } from "express";

import { auth } from "./auth.js";

export const identityRouter = Router();

identityRouter.all("/api/auth/*splat", toNodeHandler(auth));
