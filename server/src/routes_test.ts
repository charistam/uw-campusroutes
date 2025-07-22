import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { BUILDINGS, parseEdges } from './campus';
import {
    clearDataForTesting, getBuildings, getUserData, getShortestPath,
    setUserData, updateFriends, getFriends
  } from './routes';
import { readFileSync } from 'fs';
import { jsonifyFriends } from './friends';
import { jsonifySchedule } from './schedule';


const content: string = readFileSync("data/campus_edges.csv", {encoding: 'utf-8'});
parseEdges(content.split("\n"));


describe('routes', function() {
  // TODO: add or update tests to verify you can set and get friends in task 5
  
  it('data_schedule', function() {
    // No user provided
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/userData', query: {}});
    const res1 = httpMocks.createResponse();
    getUserData(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "user" was missing');

    // Request for schedule or friends list not present already should return empty.
    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/userData', query: {user: "Kevin"}});
    const res2 = httpMocks.createResponse();
    getUserData(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200); // status = OK
    assert.deepStrictEqual(res2._getData(), {schedule: [], friends: []});

    const req3 = httpMocks.createRequest(
        {method: 'POST', url: '/api/userData', body: {}});
    const res3 = httpMocks.createResponse();
    setUserData(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(),
            'missing or invalid "user" in POST body');


    // Sets friends list to have two people in it
    const req4 = httpMocks.createRequest(
        {method: 'POST', url: '/api/userData',
         body: {user: "Kevin", friends: [
            "Jonathan", "Edison"
         ]}});
    const res4 = httpMocks.createResponse();
    setUserData(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 400); // 400 because missing schedule info
    assert.deepStrictEqual(res4._getData(), {saved: true});

    // Set the schedule to have two people on it.
    const req5 = httpMocks.createRequest(
        {method: 'POST', url: '/api/userData',
         body: {user: "Kevin", schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},  // quantum ultra theory
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]}});
    const res5 = httpMocks.createResponse();
    setUserData(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData(), {saved: true});

    // Get all data schedule again to make sure it was saved.
    const req6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/userData', query: {user: "Kevin"}});
    const res6 = httpMocks.createResponse();
    getUserData(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData(), {
        schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},
            {hour: "11:30", location: "HUB", desc: "nom nom"},
        ], 
        friends: ["Jonathan", "Edison"]
    });

    clearDataForTesting();
  });

  it('getBuildings', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/buildings', query: {}});
    const res1 = httpMocks.createResponse();
    getBuildings(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {buildings: BUILDINGS});
  });

  it('getShortestPath', function() {
    // No user provided in req query
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {}});
    const res1 = httpMocks.createResponse();
    getShortestPath(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'required argument "user" was missing');
    
    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin"}});
    const res2 = httpMocks.createResponse();
    getShortestPath(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'required argument "hour" was missing');

    const req3 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "9:30"}});
    const res3 = httpMocks.createResponse();
    getShortestPath(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'user has no saved schedule');

    // sets schedule for current user (Kevin) using setData
    const req4 = httpMocks.createRequest(
        {method: 'POST', url: '/api/userData',
         body: {user: "Kevin", schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]}});
    const res4 = httpMocks.createResponse();
    setUserData(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), {saved: true});
        
    // attempts to find shortest path at hour nonexistent on schedule
    const req5 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "8:30"}});
    const res5 = httpMocks.createResponse();
    getShortestPath(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 400); // status: server error
    assert.deepStrictEqual(res5._getData(), 'user has no event starting at this hour');

    // attempts to find shortest path on first time on schedule
    const req6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "9:30"}});
    const res6 = httpMocks.createResponse();
    getShortestPath(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(res6._getData(),
        'user is not walking between classes at this hour');

    const req7 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "10:30"}});
    const res7 = httpMocks.createResponse();
    getShortestPath(req7, res7);
    assert.deepStrictEqual(res7._getStatusCode(), 200);
    assert.deepStrictEqual(res7._getData().found, true);
    assert.deepStrictEqual(res7._getData().path.length > 0, true);
    assert.deepStrictEqual(res7._getData().nearby, []);

    // TODO: improve this test to include "nearby" results in Task 5
    // friends for testing only
    const fr1 = httpMocks.createRequest(
        {method: 'POST', url: "/api/updateFriends", body: {name: "fr 1", friends: jsonifyFriends(['fr 4', 'fr 5'])}}
    )
    const fr2 = httpMocks.createRequest(
        {method: 'POST', url: "/api/updateFriends", body: {name: "fr 2", friends: jsonifyFriends(['fr 3', 'fr 4', 'fr 5'])}}
    )
    const fr3 = httpMocks.createRequest(
        {method: 'POST', url: "/api/updateFriends", body: {name: "fr 3", friends: jsonifyFriends(['fr 1', 'fr 2'])}}
    )
    const fr4 = httpMocks.createRequest(
        {method: 'POST', url: "/api/updateFriends", body: {name: "fr 4", friends: jsonifyFriends(['fr 1', 'fr 3', 'fr 5'])}}
    )
    const fr5 = httpMocks.createRequest(
        {method: 'POST', url: "/api/updateFriends", body: {name: "fr 5", friends: jsonifyFriends(['fr 2', 'fr 3'])}}
    )
    const fr6 = httpMocks.createRequest(
        {method: 'POST', url: '/api/updateFriends', body: {name: "fr 6", friends: jsonifyFriends([])}}
    )
    updateFriends(fr1, httpMocks.createResponse())
    updateFriends(fr2, httpMocks.createResponse())
    updateFriends(fr3, httpMocks.createResponse())
    updateFriends(fr4, httpMocks.createResponse())
    updateFriends(fr5, httpMocks.createResponse())
    updateFriends(fr6, httpMocks.createResponse())

    // schedules for testing only
    // schedule for fr 1
    const schedule1 = httpMocks.createRequest(
        {method: "POST", url: '/api/setData', body: {user: "fr 1", schedule: jsonifySchedule(
            [{hour: "9:30", location: "SAV", desc: "ENG 200"}, {hour: "10:30", location: "CS2", desc: "CSE 311"}]
        )}}
    )

    // schedule for fr 2
    const schedule2 = httpMocks.createRequest(
        {method: "POST", url: '/api/setData', body: {user: "fr 2", schedule: jsonifySchedule(
            [{hour: "9:30", location: "IMA", desc: "gym"}, 
             {hour: "10:30", location: "MCC", desc: "MATH 126"}, 
             {hour: "11:30", location: "HUB", desc: "nom nom"}]
        )}}
    )

    // schedule for fr 3
    const schedule3 = httpMocks.createRequest(
        {method: "POST", url: '/api/setData', body: {user: "fr 3", schedule: jsonifySchedule(
            [{hour: "10:30", location: "CS2", desc: "CSE 311"}, {hour: "11:30", location: "HUB", desc: "nom nom "}]
        )}}
    )

    // setting schedules for friends 1, 2, and 3
    setUserData(schedule1, httpMocks.createResponse())
    setUserData(schedule2, httpMocks.createResponse())
    setUserData(schedule3, httpMocks.createResponse())
    
    // no other friends walking at 10:30
    const req8 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "fr 1", hour: "10:30"}});
    const res8 = httpMocks.createResponse();
    getShortestPath(req8, res8);
    assert.deepStrictEqual(res8._getStatusCode(), 200);
    assert.deepStrictEqual(res8._getData().found, true);
    assert.deepStrictEqual(res8._getData().path.length > 0, true);
    assert.deepStrictEqual(res8._getData().nearby, []);

    const req9 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "fr 2", hour: "8:30"}});
    const res9 = httpMocks.createResponse();
    getShortestPath(req9, res9);
    assert.deepStrictEqual(res9._getStatusCode(), 400);
    assert.deepStrictEqual(res9._getData(), 'user has no event starting at this hour');

    const req10 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "fr 2", hour: "9:30"}});
    const res10 = httpMocks.createResponse();
    getShortestPath(req10, res10);
    assert.deepStrictEqual(res10._getStatusCode(), 400);
    assert.deepStrictEqual(res10._getData(), 'user is not walking between classes at this hour');

    const req11 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "fr 3", hour: "11:30"}});
    const res11 = httpMocks.createResponse();
    getShortestPath(req11, res11);
    assert.deepStrictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getData().found, true);
    assert.deepStrictEqual(res11._getData().path.length > 0, true);
    assert.deepStrictEqual(res11._getData().nearby, [{
        dist: 0, friend: 'fr 2', loc: {x: 2236.9828, y: 1379.6516}}]);
    
    });

  it('updateFriends', function() {
        const req1 = httpMocks.createRequest(
            {method: 'POST', url: '/api/updateFriends', body: {}});
        const res1 = httpMocks.createResponse();
        updateFriends(req1, res1);
        assert.deepStrictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(),
                'No name provided');

        const req2 = httpMocks.createRequest(
        {method: 'POST', url: '/api/updateFriends', body: {name: 0}});
        const res2 = httpMocks.createResponse();
        updateFriends(req2, res2);
        assert.deepStrictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(),
                'Name is not a string');

        const req3 = httpMocks.createRequest(
        {method: 'POST', url: '/api/updateFriends', body: {name: "fr 1"}});
        const res3 = httpMocks.createResponse();
        updateFriends(req3, res3);
        assert.deepStrictEqual(res3._getStatusCode(), 400);
        assert.deepStrictEqual(res3._getData(),
                'Friends is empty');
        
        // adds fr 2 and fr 3 to existing friends list of fr 1
        const req4 = httpMocks.createRequest(
        {method: 'POST', url: '/api/updateFriends', body: {name: "fr 1", friends: ["fr 2", "fr 3"]}});
        const res4 = httpMocks.createResponse();
        updateFriends(req4, res4);
        assert.deepStrictEqual(res4._getStatusCode(), 200);
        assert.deepStrictEqual(res4._getData().updated, 'success');

        // checking to see if friends list of fr 1 is correctly updated
        const req5 = httpMocks.createRequest(
            {method: 'GET', url: '/api/getFriends', query: {name: 'fr 1'}});
        const res5 = httpMocks.createResponse();
        getFriends(req5, res5);
        assert.deepStrictEqual(res5._getStatusCode(), 200);
        assert.deepStrictEqual(res5._getData().res, ['fr 4', 'fr 5', 'fr 2', 'fr 3']); 

        const req6 = httpMocks.createRequest(
            {method: 'POST', url: '/api/updateFriends', body: {name: "fr 6", friends: ["fr 1", "fr 4", "fr 5"]}});
        const res6 = httpMocks.createResponse();
        updateFriends(req6, res6);
        assert.deepStrictEqual(res6._getStatusCode(), 200);
        assert.deepStrictEqual(res6._getData().updated, 'success');
        
        
        const req7 = httpMocks.createRequest(
            {method: 'GET', url: '/api/getFriends', query: {name: 'fr 6'}});
        const res7 = httpMocks.createResponse();
        getFriends(req7, res7);
        assert.deepStrictEqual(res7._getStatusCode(), 200);
        assert.deepStrictEqual(res7._getData().res, ['fr 1', 'fr 4', 'fr 5']); 
    });
    
    it('getFriends', function() {
        const req1 = httpMocks.createRequest(
            {method: 'GET', url: '/api/getFriends', query: {}});
        const res1 = httpMocks.createResponse();
        getFriends(req1, res1);
        assert.deepStrictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(), 'Name not found');
        
        const req2 = httpMocks.createRequest(
            {method: 'GET', url: '/api/getFriends', query: {name: 0}});
        const res2 = httpMocks.createResponse();
        getFriends(req2, res2);
        assert.deepStrictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(), 'Name is not a string'); 

        const req3 = httpMocks.createRequest(
            {method: 'GET', url: '/api/getFriends', query: {name: 'fr 1'}});
        const res3 = httpMocks.createResponse();
        getFriends(req3, res3);
        assert.deepStrictEqual(res3._getStatusCode(), 200);
        assert.deepStrictEqual(res3._getData().res, ['fr 4', 'fr 5', 'fr 2', 'fr 3']); 

        clearDataForTesting();
    });
});
