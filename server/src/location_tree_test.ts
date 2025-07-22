import * as assert from 'assert';
import { buildTree, closestInTree, findClosestInTree, NO_INFO } from './location_tree';


describe('location_tree', function() {

  it('buildTree', function() {
    assert.deepStrictEqual(buildTree([]), {kind: "empty"});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}]),
        {kind: "single", loc: {x: 1, y: 1}});
    assert.deepStrictEqual(buildTree([{x: 2, y: 2}]),
        {kind: "single", loc: {x: 2, y: 2}});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}, {x: 3, y: 3}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "single", loc: {x: 1, y: 1}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "single", loc: {x: 3, y: 3}}});
    assert.deepStrictEqual(buildTree([{x: 1, y: 3}, {x: 3, y: 1}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "empty"},
         ne: {kind: "single", loc: {x: 3, y: 1}},
         sw: {kind: "single", loc: {x: 1, y: 3}},
         se: {kind: "empty"}});

    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
    assert.deepStrictEqual(buildTree(
        [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}]),
        {kind: "split", at: {x: 2, y: 2},
          nw: {kind: "split", at: {x: 0.5, y: 0.5},
            nw: {kind: "single", loc: {x: 0, y: 0}},
            ne: {kind: "empty"},
            sw: {kind: "empty"},
            se: {kind: "single", loc: {x: 1, y: 1}}},
          ne: {kind: "empty"},
          sw: {kind: "empty"},
          se: {kind: "split", at: {x: 3, y: 3},
              nw: {kind: "single", loc: {x: 2, y: 2}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "split", at: {x: 3.5, y: 3.5},
                nw: {kind: "single", loc: {x: 3, y: 3}},
                ne: {kind: "empty"},
                sw: {kind: "empty"},
                se: {kind: "single", loc: {x: 4, y: 4}}}}});
    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 3}, {x: 7, y: 1},
         {x: 1, y: 7}, {x: 3, y: 5}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "split", at: {x: 6, y: 2},
              nw: {kind: "empty"},
              sw: {kind: "single", loc: {x: 5, y: 3}},
              ne: {kind: "single", loc: {x: 7, y: 1}},
              se: {kind: "empty"}},
         sw: {kind: "split", at: {x: 2, y: 6},
              nw: {kind: "empty"},
              ne: {kind: "single", loc: {x: 3, y: 5}},
              sw: {kind: "single", loc: {x: 1, y: 7}},
              se: {kind: "empty"}},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
  });

  it('closestInTree', function() {
    // TODO: implement this in Task 4
    // distance from loc to bounds of region is greater than distance to closest
    assert.deepStrictEqual(closestInTree(
        buildTree([{x: 1, y: 1}]), {x: 5, y: 10}, 
        {x1: 0, x2: 8, y1: 0, y2: 8}, {loc: {x: 5, y: 9}, dist: 1}),
      {loc: {x: 5, y: 9}, dist: 1});

    // tree is empty (should return closest)
    assert.deepStrictEqual(closestInTree(
      buildTree([]), {x: 5, y: 10}, 
      {x1: -10, x2: 10, y1: -10, y2: 10}, {loc: {x: 5, y: 9}, dist: 1}),
    {loc: {x: 5, y: 9}, dist: 1});

    // tree kind is single
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 5, y: 8}]), {x: 5, y: 10}, 
      {x1: 0, x2: 8, y1: 0, y2: 8}, {loc: {x: 5, y: 4}, dist: 6}),
    {loc: {x: 5, y: 8}, dist: 2});
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 8, y: 16}]), {x: 5, y: 10}, 
      {x1: 0, x2: 8, y1: 0, y2: 8}, {loc: {x: 5, y: 9}, dist: 1}),
      {loc: {x: 5, y: 9}, dist: 1});

    // tree kind is split (loop recursion, 1 case)
    // loc closest to NW (no starting closest location)
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: -8, y: 8}, {x: 8, y: 8}, {x: 8, y: -8}, {x: -8, y: -8}]), 
      {x: -1, y: -8}, {x1: -10, x2: 10, y1: -10, y2: 10}, NO_INFO),
    {loc: {x: -8, y: -8}, dist: 7});
    // loc closest to NE (no starting closest location)
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: -8, y: 8}, {x: 8, y: 8}, {x: 8, y: -8}, {x: -8, y: -8}]), 
      {x: 1, y: -8}, {x1: -10, x2: 10, y1: -10, y2: 10}, NO_INFO),
    {loc: {x: 8, y: -8}, dist: 7});
    // loc closest to SW (no starting closest location)
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: -8, y: 8}, {x: 8, y: 8}, {x: 8, y: -8}, {x: -8, y: -8}]), 
      {x: -1, y: 8}, {x1: -10, x2: 10, y1: -10, y2: 10}, NO_INFO),
    {loc: {x: -8, y: 8}, dist: 7});
    // loc closest to SE (no starting closest location)
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: -8, y: 8}, {x: 8, y: 8}, {x: 8, y: -8}, {x: -8, y: -8}]), 
      {x: 1, y: 8}, {x1: -10, x2: 10, y1: -10, y2: 10}, NO_INFO),
    {loc: {x: 8, y: 8}, dist: 7});
    // loc closest to SE but closest is closer
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: -8, y: 8}, {x: 8, y: 8}, {x: 8, y: -8}, {x: -8, y: -8}]), 
      {x: 1, y: 8}, {x1: -10, x2: 10, y1: -10, y2: 10}, {loc: {x: 8, y: 6}, dist: 2}),
    {loc: {x: 8, y: 6}, dist: 2});
    
    
    // tree kind is split (loop recursion, many case)
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: -8, y: 8}, {x: 8, y: 8}, {x: 2, y: 2}, {x: 4, y: 4}]), 
      {x: -2, y: 2}, {x1: -10, x2: 10, y1: -10, y2: 10}, NO_INFO),
    {loc: {x: 2, y: 2}, dist: 4});
  });

  // TODO: uncomment these in Task 4
  it('findClosestInTree', function() {
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 2, y: 1}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 3, y: 1}, {x: 2, y: 1}, {x: 1, y: 3}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: 4.9, y: 4.9}]),
      [{x: 5, y: 5}, Math.sqrt((5-4.9)**2+(5-4.9)**2)]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: -1, y: -1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 4, y: 1}, {x: -1, y: -1}, {x: 10, y: 10}]),
      [{x: 5, y: 1}, 1]);
  });
});
