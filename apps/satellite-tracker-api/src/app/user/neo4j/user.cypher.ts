export const UserNeoQueries = {
    followUser:
        'MATCH (a:User {username: $username}), (b:User {username: $username}) MERGE (a)-[follow:FOLLOWS {since: $now])}]->(b)',
    unfollowUser: 'MATCH (a:User {username: $username})-[follow:FOLLOWS]->(b:User {username: $username}) DELETE follow',
    trackSatellite:
        'MATCH (a:User {username: $username}), (b:Satellite {id: $id}) MERGE (a)-[track:TRACKS {since: $now}]->(b)',
    untrackSatellite: 'MATCH (a:User {username: $username})-[track:TRACKS]->(b:Satellite {id: $id}) DELETE track',
    getSatellitesPeopleYouFollowTrack:
        'MATCH (u:User {username: $username})-[:FOLLOWS]->(f:User)-[:TRACKS]->(s:Satellite) WHERE NOT (u)-[:TRACKS]->(s) RETURN s',
    getUsersWhoTrackTwoOrMoreOfTheSameSatellitesYouTrack:
        'MATCH (u:User {username: $username)-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(f:User) WHERE NOT (u)-[:FOLLOWS]->(f) WITH f, count(s) AS count WHERE count > 1 RETURN f',
    getWhoUsersYouFollowFollow:
        'MATCH (u:User {username: $username})-[:FOLLOWS*2..4]->(f:User) WHERE NOT (u)-[:FOLLOWS]->f RETURN f',
    getUsersWhoFollowYouFollow:
        'MATCH (u:User {username: $username})<-[:FOLLOWS]-(f:User)->[:FOLLOWS]->(ff:User) WHERE NOT (u)-[:FOLLOWS]->ff RETURN ff',
    getSatellitesPeopleTrackThatAlsoTrackYourSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User)->[:TRACKS]->(ff:Satellite) WHERE NOT (u)-[:TRACKS]->ff RETURN ff',
    getSatellitesPeopleTrackThatAlsoTrackAtLeastTwoOfYourSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count > 1 MATCH (f)-[:TRACKS]->(ff:Satellite) MATCH (u:User {username: $username}) WHERE NOT (u)-[:TRACKS]->(ff) RETURN ff',
    getCreatorsOfSatellitesPeopleTrackThatAlsoTrackAtLeastTwoOfYourSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count > 1 MATCH (f)-[:TRACKS]->(ff:Satellite) MATCH (u:User {username: $username}) MATCH (creator:User)-[:CREATED]->(ff) WHERE NOT (u)-[:FOLLOWS]->(creator) AND creator<>u RETURN creator',
    satellitesUsersYouFollowAndUsersTheyFollowTrack:
        'MATCH (u:User {username: $username})-[:TRACKS|FOLLOWS*1..4]->(s:Satellite) RETURN s',
    getMostFollowedUsers:
        'MATCH (u:User)<-[:FOLLOWS]-(f:User) RETURN u, count(f) AS followers ORDER BY followers DESC LIMIT 10',
};
