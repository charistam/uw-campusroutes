import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BUILDINGS, EDGES, getBuildingByShortName, locationsOnPath } from './campus';
import { findPath } from './pathfinder';
import { indexAtHour, jsonifySchedule, parseHour, parseSchedule, Schedule } from "./schedule";
import { Nearby } from "./nearby";
import { Friends, parseFriends, jsonifyFriends } from "./friends";
import { buildTree, findClosestInTree } from "./location_tree";

// TODO: ADD or EDIT data structures, route handler functions and
//       endpoints defined in index.ts as needed to enable server
//       to store friends for each user
//       - friends.ts defines a type that you can use to represent
//         a set of friends with some helpful functions


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

// Map from user names to their schedules. Defaults to an empty schedule.
const allSchedules: Map<string, Schedule> = new Map<string, Schedule>();

// Map from user names to their friends. 
const allFriends: Map<string, Friends> = new Map<string, Friends>();


/** Called from the tests to clear out any data stored during the current test. */
export const clearDataForTesting = (): void => {
  allSchedules.clear();
}

/** Returns a list of friends and a schedule of the given user. */
export const getUserData = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const schedule = allSchedules.get(user);
  const scheduleJson = schedule ===  undefined ? [] : jsonifySchedule(schedule);

  if (typeof user !== "string") {
    res.status(400).send("Name is not a string");
    return;
  }

  const friends = allFriends.get(user);
  if (!friends) {
    allFriends.set(user, []);
    res.send({schedule: scheduleJson, friends: []})
  } else {
    res.send({schedule: scheduleJson, friends: friends})
  }
}

/** Sets the the schedule for the given user */
export const setUserData = (req: SafeRequest, res: SafeResponse): void => {
  if (typeof req.body.user !== 'string') {
    res.status(400).send('missing or invalid "user" in POST body');
    return;
  }

  if (req.body.schedule !== undefined) {
    const schedule = parseSchedule(req.body.schedule);
    allSchedules.set(req.body.user, schedule);
  } else {
    res.status(400).send('missing or invalid schedule information');
  }

  if (req.body.friends !== undefined) {
    const friends = parseFriends(req.body.friends);
    allFriends.set(req.body.user, friends);
  } 

  res.send({saved: true});
}


/** Returns a list of all known buildings. */
export const getBuildings = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({buildings: BUILDINGS});
};


/** Returns shortest path for user and closest point in path of friend. */
export const getShortestPath = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const hourStr = first(req.query.hour);
  if (hourStr === undefined) {
    res.status(400).send('required argument "hour" was missing');
    return;
  }

  const schedule = allSchedules.get(user);
  if (schedule === undefined) {
    res.status(400).send('user has no saved schedule');
    return;
  }

  const hour = parseHour(hourStr);
  const index = indexAtHour(schedule, hour);
  if (index < 0) {
    res.status(400).send('user has no event starting at this hour');
    return;
  } else if (index === 0) {
    res.status(400).send('user is not walking between classes at this hour');
    return;
  }

  // Find the shortest path for this user's walk at this time.
  const start = getBuildingByShortName(schedule[index-1].location);
  const end = getBuildingByShortName(schedule[index].location);
  const path = findPath(start.location, end.location, EDGES);
  if (!path) {
    res.send({found: false});
    return;
  }

  const nearby: Array<Nearby> = [];

  // TODO: initialize with actual list of friends for this user
  //       (feel free to change the type of this variable)
  const friends: Friends | undefined = allFriends.get(user);

  // For any friends that are also walking at this time, record the closest
  // point on _this user's path_ to any point on their walk in the nearby list.
  if (friends !== undefined) {
    // Get all of the locations on the user's walk, put them in a tree
    const userLocsTree = buildTree(locationsOnPath(path.steps));

    // Iterate through all friends had by this user
    for (const friend of friends) {
      // TODO: make sure 'friend' is friends with 'user' also 
      // FIX THIS PART
      // check if allFriends.has(name) -> return false
      // check if allFriends.get(name) is undefined -> return false
      // return true if allFriends.get(name).includes(friend)
      if (!isFriend(user, friend)) {
        continue;
      }

      // Get the friend's schedule. (Can skip them if they don't have one.)
      const fSched = allSchedules.get(friend);
      if (fSched === undefined)
        continue;

      // See if friend walks at this time. (skip them if not.)
      const fIndex = indexAtHour(fSched, hour);
      if (fIndex <= 0)
        continue;
      const fStart = getBuildingByShortName(fSched[fIndex-1].location);
      const fEnd = getBuildingByShortName(fSched[fIndex].location);

      // Find all the points on the friend's walk.
      const fPath = findPath(fStart.location, fEnd.location, EDGES);
      if (!fPath)
        continue;
      const friendLocs = locationsOnPath(fPath.steps);

      // TODO:
      //  - Call findClosestInTree with userLocsTree, and friendLocs
      //    (IF there are any locations in friendLocs)
      //  - Then add to nearby with that closest location, distance, 
      //    and the current friend 
      if (friendLocs === undefined) {
        return;
      }
      const closest = findClosestInTree(userLocsTree, friendLocs)
      nearby.push({friend: friend, dist: closest[1], loc: closest[0]})
    }
  }

  res.send({found: true, path: path.steps, nearby: nearby});
};

/** Checks if 'friend' is friends with user */
const isFriend = (user: string, friend: string): boolean => {
  if (!allFriends.has(user)) {
    return false;
  }

  const friendsList = allFriends.get(friend)
  if (!friendsList) {
    return false;
  }

  if (friendsList.includes(user)) {
    return true;
  }
  return false;
}

/** Returns list of friends for a certain user */
export const getFriends = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.query.name;
  if (name === undefined) {
    res.status(400).send("Name not found")
    return;
  }
  if (typeof name !== "string") {
    res.status(400).send("Name is not a string");
    return;
  }

  const friends = allFriends.get(name);
  
  res.send({res: friends})
};

/** Updates list of friends for a certain user */
export const updateFriends = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (name === undefined) {
    res.status(400).send("No name provided");
    return;
  }
  if (typeof name !== 'string') {
    res.status(400).send("Name is not a string");
    return;
  }
  
  const friendsJson = req.body.friends;
  if (friendsJson === undefined) {
    res.status(400).send("Friends is empty");
    return;
  }

  const friends = parseFriends(friendsJson);
  const temp = jsonifyFriends(friends);

  if (temp + "" !== req.body.friends + "") {
    res.status(400).send("Friends list is not an array");
    return;
  }

  const curFriendsList = allFriends.get(name)

  // If user has no existing list of friends, make a new list and push friends
  if (!curFriendsList) {
    allFriends.set(name, friends)
  } 
  // Otherwise, push elements of friends to existing list
  else {
    for (const friend of friends) {
      if (friend + "" !== name + "" && !curFriendsList.includes(friend)) {
        curFriendsList?.push(friend)
      }
    }
    allFriends.set(name, curFriendsList)
  }

  res.send({updated: "success"})
}

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
