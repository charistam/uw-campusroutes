import * as assert from 'assert';
import {
    centroid, distance, sameLocation, squaredDistance, distanceMoreThan
  } from './locations';


describe('locations', function() {

  it('sameLocations', function() {
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 0, y: 0}), true);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 0, y: 1}), true);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 1, y: 0}), true);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 1, y: 1}), true);

    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 1, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 1, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 1, y: 0}), false);
  });

  it('squaredDistance', function() {
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 1, y: 1}), 2);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 0, y: 1}), 1);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 1, y: 0}), 1);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 2, y: 0}), 4);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 0, y: 2}), 4);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 2, y: 2}), 8);
  });

  it('distance', function() {
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 1, y: 1}) - Math.sqrt(2)) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 0, y: 1}) - 1) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 1, y: 0}) - 1) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 2, y: 0}) - 2) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 0, y: 2}) - 2) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 2, y: 2}) - Math.sqrt(8)) < 1e-3);
  });

  it('centroid', function() {
    assert.deepStrictEqual(centroid([{x: 0, y: 1}]), {x: 0, y: 1});
    assert.deepStrictEqual(centroid([{x: 1, y: 2}]), {x: 1, y: 2});

    assert.deepStrictEqual(centroid([{x: 0, y: 0}, {x: 1, y: 2}]), {x: 0.5, y: 1});
    assert.deepStrictEqual(centroid([{x: 0, y: 0}, {x: 1, y: 2}]), {x: 0.5, y: 1});
    assert.deepStrictEqual(centroid([{x: 0, y: 1}, {x: 1, y: 2}]), {x: 0.5, y: 1.5});
    assert.deepStrictEqual(
        centroid([{x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 3}]), {x: 1, y: 2});
  });

  it('distanceMoreThan', function() {
    // TODO: write these in task 3
    // tests if loc is inside region
    assert.deepStrictEqual(
      distanceMoreThan({x: 1, y: 1}, {x1: 0, x2: 10, y1: 0, y2: 10}, 5),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: 1, y: 1}, {x1: 0, x2: 10, y1: 0, y2: 10}, -5),
      true);

    // tests if loc is directly above region
    assert.deepStrictEqual(
      distanceMoreThan({x: 1, y: -5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 10),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: 1, y: -5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 4),
      true);

    // tests if loc is directly below region
    assert.deepStrictEqual(
      distanceMoreThan({x: 1, y: 12}, {x1: 0, x2: 10, y1: 0, y2: 10}, 5),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: 1, y: 12}, {x1: 0, x2: 10, y1: 0, y2: 10}, 1),
      true);

    // tests if loc is directly left of region
    assert.deepStrictEqual(
      distanceMoreThan({x: -3, y: 5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 5),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: -3, y: 5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 2),
      true);

    // tests if loc is directly right of region
    assert.deepStrictEqual(
      distanceMoreThan({x: 14, y: 5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 5),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: 14, y: 5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 3),
      true);

    // tests if loc is northwest of region
    assert.deepStrictEqual(
      distanceMoreThan({x: -5, y: -5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 10),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: -5, y: -5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 2),
      true);
    
    // tests if loc is southwest of region
    assert.deepStrictEqual(
      distanceMoreThan({x: -5, y: 15}, {x1: 0, x2: 10, y1: 0, y2: 10}, 10),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: -5, y: 15}, {x1: 0, x2: 10, y1: 0, y2: 10}, 2),
      true);

    // // tests if loc is northeast of region
    assert.deepStrictEqual(
      distanceMoreThan({x: 15, y: -5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 10),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: 15, y: -5}, {x1: 0, x2: 10, y1: 0, y2: 10}, 2),
      true);

    // // tests if loc is southeast of region
    assert.deepStrictEqual(
      distanceMoreThan({x: 15, y: 15}, {x1: 0, x2: 10, y1: 0, y2: 10}, 10),
      false);
    assert.deepStrictEqual(
      distanceMoreThan({x: 15, y: 15}, {x1: 0, x2: 10, y1: 0, y2: 10}, 3),
      true);
    
  });

});
