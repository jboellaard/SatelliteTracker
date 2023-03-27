export const SatelliteNeoQueries = {
    /**
     * params: username, satelliteName
     *
     * returns: satellite
     */
    addSatellite:
        'MATCH (u:User {username: $username }) \
        CREATE (satellite:Satellite {satelliteName: $satelliteName, createdBy: $username }) \
        MERGE (u)-[:CREATED {createdAt: datetime()}]->(satellite) \
        MERGE (u)-[:TRACKS {since: datetime()}]->(satellite) RETURN satellite',
    /**  params: satelliteName */
    deleteSatelliteByName: 'MATCH (satellite:Satellite {satelliteName: $satelliteName}) DETACH DELETE satellite',
    /**
     * params: satelliteName
     *
     * returns: satellite
     */
    updateSatelliteName:
        'MATCH (satellite:Satellite {satelliteName: $satelliteName}) SET satellite.satelliteName = $newSatelliteName RETURN satellite',
    /**
     * params: satelliteName, launchDate
     *
     * returns: satellite
     */
    updateSatelliteLaunchDate:
        'MATCH (satellite:Satellite {satelliteName: $satelliteName}) SET satellite.launchDate = $launchDate RETURN satellite',
    /**
     * params: satelliteName
     *
     * returns: satellite
     * */
    removeSatelliteLaunchDate:
        'MATCH (satellite:Satellite {satelliteName: $satelliteName}) REMOVE satellite.launchDate RETURN satellite',
    /** params: username, creator, satelliteName */
    trackSatellite:
        'MATCH (a:User {username: $username}), (satellite:Satellite {createdBy: $creator, satelliteName: $satelliteName}) MERGE (a)-[track:TRACKS {since: datetime()}]->(satellite)',
    /**params: username, creator, satelliteName */
    untrackSatellite:
        'MATCH (a:User {username: $username})-[track:TRACKS]->(b:Satellite {createdBy: $creator, satelliteName: $satelliteName}) DELETE track',
    /**
     * params: username
     *
     * returns: satellite
     */
    getTrackedSatellites: 'MATCH (a:User {username: $username})-[track:TRACKS]->(satellite:Satellite) RETURN satellite',
    /**
     * params: creator, satelliteName
     *
     * returns: tracker
     */
    getTrackers:
        'MATCH (tracker:User)-[track:TRACKS]->(satellite:Satellite {createdBy: $creator, satelliteName: $satelliteName}) RETURN tracker',
    /**
     * params: list (of usernames), skip, limit
     *
     * returns: user, satellite, create
     */
    getMostRecentlyCreated:
        'MATCH (user:User)-[create:CREATED]->(satellite:Satellite) WHERE user.username IN $list RETURN user, satellite, create ORDER BY create.createdAt DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
    /**
     * params: list (of usernames), skip, limit
     *
     * returns: user, satellite, track
     */
    getMostRecentlyTracked:
        'MATCH (user:User)-[track:TRACKS]->(satellite:Satellite) WHERE user.username IN $list RETURN user, satellite, track ORDER BY track.since DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
};
