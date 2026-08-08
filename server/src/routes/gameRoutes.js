import { Router } from "express";
import {
    startGame,
    validateCharacter,
    saveScore,
    getLeaderboard,
} from "../controllers/gameController.js";

const gameRouter = Router();

gameRouter.post("/", startGame);
gameRouter.post("/:gameId/validate", validateCharacter);
gameRouter.patch("/:gameId/score", saveScore);
gameRouter.get("/leaderboard", getLeaderboard);

export default gameRouter;