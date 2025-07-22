/** Represents an (x, y) coordinate location on the map. */
export type Location = {x: number, y: number};

/** 
 * Determines whether the two given locations are the same. 
 * @returns true if (loc1.x, loc1.y) = (loc2.x, loc2.y)
 */
export const sameLocation = (loc1: Location, loc2: Location): boolean => {
  return loc1.x === loc2.x && loc1.y === loc2.y;
}

/** 
 * Returns the squared distance between the two given locations 
 * @returns dist(loc1, loc2)^2
 */
export const squaredDistance = (loc1: Location, loc2: Location): number => {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return dx*dx + dy*dy;
};

/** 
 * Returns the distance between the two given locations 
 * @returns dist(loc1, loc2)
 */
export const distance = (loc1: Location, loc2: Location): number => {
  return Math.sqrt(squaredDistance(loc1, loc2));
};

/**
 * Returns the average position of the given locations.
 * @param locs to average over, length must be >= 1
 * @returns Location representing average of all locs
 */
export const centroid = (locs: Array<Location>): Location => {
  let sx = 0;
  let sy = 0;
  let i = 0;
  
  // Inv: sx = sum of locs[j].x for j = 0 .. i-1 and
  //      sy = sum of locs[j].y for j = 0 .. i-1
  while (i !== locs.length) {
    sx += locs[i].x;
    sy += locs[i].y;
    i = i + 1;
  }

  return {x: sx / locs.length, y: sy / locs.length};
};


/**
 * Represents a rectangular range of space on the map. Note that infinite values
 * (Infinity and -Infinity) are allowed for the ends of either dimension.
 * Inv: x1 <= x2 and y1 <= y2
 */
export type Region = {x1: number, x2: number, y1: number, y2: number};


/**
 * Determines whether the distance from a given location to a given region 
 * is more than the given distance.
 * 
 * @param loc given location
 * @param region given region
 * @param dist to compare to distance between loc and region
 * @returns true if the distance from loc to closest point in Region is > than dist
 */
export const distanceMoreThan = (loc: Location, region: Region, dist: number): boolean => {
  // TODO: implement this in Task 3
  if (region.x1 <= loc.x && loc.x <= region.x2 && region.y1 <= loc.y && region.y2 >= loc.y) { // checks if loc is within region
    return 0 > dist;
  } else if (region.x1 < loc.x && loc.x < region.x2) { 
    if (loc.y < region.y1) { // checks if loc is directly above region
      return (squaredDistance(loc, {x: loc.x, y: region.y1}) > dist*dist)
    } else { // checks if loc is directly below region
      return (squaredDistance(loc, {x: loc.x, y: region.y2}) > dist*dist)
    }
  } else if (region.y1 < loc.y && loc.y < region.y2) {
    if (loc.x < region.x1) { // checks if loc is directly left of region
      return (squaredDistance(loc, {x: region.x1, y: loc.y}) > dist*dist)
    } else { // checks if loc is directly right of region
      return (squaredDistance(loc, {x: region.x2, y: loc.y}) > dist*dist)
    }
  } else if (loc.x < region.x1 && loc.y < region.y1) { // loc is northwest of region
    return (squaredDistance(loc, {x: region.x1, y: region.y1}) > dist*dist)
  } else if (loc.x < region.x1 && loc.y > region.y2) { // loc is southwest of region
    return (squaredDistance(loc, {x: region.x1, y: region.y2}) > dist*dist)
  } else if (loc.x > region.x2 && loc.y < region.y1) { // loc is northeast of region
    return (squaredDistance(loc, {x: region.x2, y: region.y1}) > dist*dist)
  } else if (loc.x > region.x1 && loc.y > region.y2) { // loc is southeast of region
    return (squaredDistance(loc, {x: region.x2, y: region.y2}) > dist*dist)
  }

  return false; // should not reach this point ??
}