import express, { Express } from "express";
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { parseEdges } from "./campus";
import { 
  getUserData, setUserData, getShortestPath, getBuildings, getFriends, updateFriends
} from './routes';


// Parse the information about the walkways on campus.
const content: string = readFileSync("data/campus_edges.csv", {encoding: 'utf-8'});
parseEdges(content.split("\n"));


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/buildings", getBuildings);
app.get("/api/getData", getUserData); // gets schedules and friends for each user
app.post("/api/setData", setUserData); // sets schedules and friends for each user
app.get("/api/shortestPath", getShortestPath); // gets shortest path for user and closest point in friend's path
app.get("/api/getFriends", getFriends);
app.post("/api/updateFriends", updateFriends);
app.listen(port, () => console.log(`Server listening on ${port}`));
