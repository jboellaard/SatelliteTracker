export const RecommendationsNeoQueries = {
    /**
     * params: username, count, skip, limit
     *
     * returns: user
     */
    getSimilarTrackers:
        'MATCH (u:User {username: $username})-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(user:User) WHERE NOT (u)-[:FOLLOWS]->(user) WITH user, count(s) AS count WHERE count >= toInteger($count) RETURN DISTINCT user ORDER BY user.username SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * who users you follow follow
     *
     * params: username, count, skip, limit
     *
     * returns: user
     */
    getRecommendedUsers:
        'MATCH (u:User {username: $username})-[:FOLLOWS*2..4]->(user:User) WHERE NOT (u)-[:FOLLOWS]->(user) AND user<>u RETURN DISTINCT user ORDER BY user.username SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: username, count, skip, limit
     *
     * returns: user
     */
    getUsersWhoFollowYouFollow:
        'MATCH (u:User {username: $username})<-[:FOLLOWS]-(f:User)-[:FOLLOWS]->(user:User) WITH u, user, count(user) AS count WHERE count >= toInteger($count) AND NOT (u)-[:FOLLOWS]->(user) AND user<>u RETURN DISTINCT user ORDER BY user.username SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: username, count, skip, limit
     *
     * returns: satellite
     */
    getRecommendedSatellitesFromTracking:
        'MATCH (u:User {username: $username})-[:TRACKS]->(s:Satellite)<-[:TRACKS]-(f:User) WITH u, f, count(s) AS count WHERE count >= toInteger($count) MATCH (f)-[:TRACKS]->(satellite:Satellite) WHERE NOT (u)-[:TRACKS]->(satellite) RETURN DISTINCT satellite ORDER BY satellite.satelliteName SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: username, count, skip, limit
     *
     * returns: satellite
     */
    getSimilarCreatedSatellites:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count >= toInteger($count) MATCH (f)-[:TRACKS]->(satellite:Satellite) MATCH (u:User {username: $username}) WHERE NOT (u)-[:TRACKS]->(satellite) RETURN DISTINCT satellite ORDER BY satellite.satelliteName SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * user's followers also follow these satellites
     *
     * params: username, count, skip, limit
     *
     * returns: creator
     */
    getSimilarCreators:
        'MATCH (s:Satellite {createdBy: $username})<-[:TRACKS]-(f:User) WITH f, count(s) AS count WHERE count >= toInteger($count) MATCH (f)-[:TRACKS]->(ss:Satellite) MATCH (u:User {username: $username}) MATCH (creator:User)-[:CREATED]->(ss) WHERE NOT (u)-[:FOLLOWS]->(creator) AND creator<>u RETURN DISTINCT creator ORDER BY creator.username SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * satellites that users you follow and who they follow track
     *
     * params: username, count, skip, limit
     *
     * returns: satellite
     */
    getRecommendedSatellitesFromFollowing:
        'MATCH (u:User {username: $username})-[:TRACKS|FOLLOWS*1..2]->(satellite:Satellite) WITH u, satellite, count(satellite) AS count WHERE count >= toInteger($count) AND NOT (u)-[:TRACKS]->(satellite) AND NOT satellite.createdBy=$username RETURN DISTINCT satellite ORDER BY satellite.satelliteName SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: skip, limit
     *
     * returns: user, followers
     */
    getMostFollowedUsers:
        'MATCH (user:User)<-[:FOLLOWS]-(f:User) RETURN DISTINCT user, count(f) AS followers ORDER BY followers DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: skip, limit
     *
     * returns satellite, trackers
     */
    getMostTrackedSatellites:
        'MATCH (u:User)-[:TRACKS]->(satellite:Satellite) RETURN DISTINCT satellite, count(u) AS trackers ORDER BY trackers DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: skip, limit
     *
     * returns satellite, created
     */
    getMostRecentlyCreatedSatellites:
        'MATCH (satellite:Satellite)<-[created:CREATED]-(u:User) RETURN DISTINCT satellite, created ORDER BY created.createdAt DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
};
