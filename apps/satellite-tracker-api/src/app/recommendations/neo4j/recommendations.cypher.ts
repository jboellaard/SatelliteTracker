export const RecommendationsNeoQueries = {
    getSimilarTrackers:
        'MATCH (u:User {username: $username})-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(f:User) WHERE NOT (u)-[:FOLLOWS]->(f) WITH f, count(s) AS count WHERE count > 1 RETURN DISTINCT f ORDER BY f.username LIMIT $limit',
    // who users you follow follow
    getRecommendedUsers:
        'MATCH (u:User {username: $username})-[:FOLLOWS*2..$depth]->(f:User) WHERE NOT (u)-[:FOLLOWS]->(f) AND f<>u RETURN DISTINCT f ORDER BY f.username LIMIT $limit',
    getUsersWhoFollowYouFollow:
        'MATCH (u:User {username: $username})<-[:FOLLOWS]-(f:User)-[:FOLLOWS]->(ff:User) WITH u, ff, count(ff) AS count WHERE count > 1 AND NOT (u)-[:FOLLOWS]->(ff) AND ff<>u RETURN DISTINCT ff ORDER BY ff.username LIMIT $limit',
    getRecommendedSatellitesFromTracking:
        'MATCH (u:User {username: $username})-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(f:User) WITH u, f, count(s) AS count WHERE count > 1 MATCH (f)-[:TRACKS]->(ss:Satellite) WHERE NOT (u)-[:TRACKS]->(ss) RETURN DISTINCT ss ORDER BY ss.satelliteName  LIMIT $limit',
    getSimilarCreatedSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count >= $count MATCH (f)-[:TRACKS]->(ss:Satellite) MATCH (u:User {username: $username}) WHERE NOT (u)-[:TRACKS]->(ss) RETURN DISTINCT ss ORDER BY ss.satelliteName LIMIT $limit',
    // user's followers also follow these satellites
    getSimilarCreators:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count >= $count MATCH (f)-[:TRACKS]->(ss:Satellite) MATCH (u:User {username: $username}) MATCH (creator:User)-[:CREATED]->(ss) WHERE NOT (u)-[:FOLLOWS]->(creator) AND creator<>u RETURN DISTINCT creator ORDER BY creator.username LIMIT $limit',
    // satellites that users you follow and who they follow track
    getRecommendSatellitesFromFollowing:
        'MATCH (u:User {username: $username})-[:TRACKS|FOLLOWS*1..$depth]->(s:Satellite) WITH u,s, count(s) AS count WHERE count >= $count AND NOT (u)-[:TRACKS]->(s) RETURN DISTINCT s ORDER BY s.satelliteName LIMIT $limit',
    getMostFollowedUsers:
        'MATCH (u:User)<-[:FOLLOWS]-(f:User) RETURN DISTINCT u, count(f) AS followers ORDER BY followers DESC LIMIT $limit',
    getMostTrackedSatellites:
        'MATCH (u:User)-[:TRACKS]->(s:Satellite) RETURN DISTINCT s, count(u) AS trackers ORDER BY trackers DESC LIMIT $limit',
    getMostRecentlyCreatedSatellites:
        'MATCH (s:Satellite)<-[c:CREATED]-(u:User) RETURN DISTINCT s.satelliteName, c.createdAt ORDER BY c.createdAt DESC LIMIT $limit',
};
