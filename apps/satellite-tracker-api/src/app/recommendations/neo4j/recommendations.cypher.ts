export const RecommendationsNeoQueries = {
    getSatellitesPeopleYouFollowTrack:
        'MATCH (u:User {username: $username})-[:FOLLOWS]->(f:User)-[:TRACKS]->(s:Satellite) WHERE NOT (u)-[:TRACKS]->(s) RETURN s',
    getUsersWhoTrackTwoOrMoreOfTheSameSatellitesYouTrack:
        'MATCH (u:User {username: $username)-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(f:User) WHERE NOT (u)-[:FOLLOWS]->(f) WITH f, count(s) AS count WHERE count > 1 RETURN f',
    // who users you follow follow
    getRecommendedUsers:
        'MATCH (u:User {username: $username})-[:FOLLOWS*2..$depth]->(f:User) WHERE NOT (u)-[:FOLLOWS]->f RETURN f',
    getUsersWhoFollowYouFollow:
        'MATCH (u:User {username: $username})<-[:FOLLOWS]-(f:User)-[:FOLLOWS]->(ff:User) WITH u, ff, count(ff) AS count WHERE count > 1 AND NOT (u)-[:FOLLOWS]->(ff) AND ff<>u RETURN ff',
    getRecommendedSatellitesFromTracking:
        'MATCH (u:User {username: $username})-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count > 1 MATCH (f)-[:TRACKS]->(ff:Satellite) WHERE NOT (u)-[:TRACKS]->(ff) RETURN ff',
    getSatellitesPeopleTrackThatAlsoTrackYourSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User)->[:TRACKS]->(ff:Satellite) WHERE NOT (u)-[:TRACKS]->ff RETURN ff',
    getSimilarCreatedSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count > 1 MATCH (f)-[:TRACKS]->(ff:Satellite) MATCH (u:User {username: $username}) WHERE NOT (u)-[:TRACKS]->(ff) RETURN ff',
    // user's followers also follow these satellites
    getSimilarCreators:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count > 1 MATCH (f)-[:TRACKS]->(ff:Satellite) MATCH (u:User {username: $username}) MATCH (creator:User)-[:CREATED]->(ff) WHERE NOT (u)-[:FOLLOWS]->(creator) AND creator<>u RETURN creator',
    // satellites that users you follow and who they follow track
    getRecommendSatellitesFromFollowing:
        'MATCH (u:User {username: $username})-[:TRACKS|FOLLOWS*1..4]->(s:Satellite) WITH u,s, count(s) AS count WHERE count > 1 AND NOT (u)-[:TRACKS]->(s) RETURN s',
    getMostFollowedUsers:
        'MATCH (u:User)<-[:FOLLOWS]-(f:User) RETURN u, count(f) AS followers ORDER BY followers DESC LIMIT $limit',
    getMostTrackedSatellites:
        'MATCH (u:User)-[:TRACKS]->(s:Satellite) RETURN s, count(u) AS trackers ORDER BY trackers DESC LIMIT $limit',
    getMostRecentlyCreatedSatellites:
        'MATCH (s:Satellite)<-[c:CREATED]-(u:User) RETURN s.satelliteName, c.createdAt ORDER BY c.createdAt DESC LIMIT $limit',
};
