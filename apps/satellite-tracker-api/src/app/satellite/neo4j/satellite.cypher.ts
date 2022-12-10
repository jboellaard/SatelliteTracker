export const SatelliteNeoQueries = {
    addSatellite:
        'MATCH (u:User {username: $username }) \
        CREATE (s:Satellite {satelliteName: $satelliteName, createdBy: $username }) \
        MERGE (u)-[:CREATED {createdAt: datetime()}]->(s)  RETURN s',
    deleteSatelliteByName: 'MATCH (s:Satellite {satelliteName: $satelliteName}) DETACH DELETE s',
    updateSatelliteName:
        'MATCH (s:Satellite {satelliteName: $satelliteName}) SET s.satelliteName = $newSatelliteName RETURN s',
    // updateSatelliteLaunchLocation:
    //     'MATCH (s:Satellite {satelliteName: $satelliteName}) SET s.launchLongitude = $launchLongitude, s.launchLatitude = $launchLatitude RETURN s',
    // removeSatelliteLaunchLocation:
    //     'MATCH (s:Satellite {satelliteName: $satelliteName}) REMOVE s.launchLongitude, s.launchLatitude RETURN s',
    updateSatelliteLaunchDate:
        'MATCH (s:Satellite {satelliteName: $satelliteName}) SET s.launchDate = $launchDate RETURN s',
    removeSatelliteLaunchDate: 'MATCH (s:Satellite {satelliteName: $satelliteName}) REMOVE s.launchDate RETURN s',
    getTop10Satellites:
        'MATCH (s:Satellite)<-[:TRACKS]-(u:User) RETURN s.satelliteName, count(u) AS followers ORDER BY followers DESC LIMIT 10',
    getThreeMostRecentSatellites:
        'MATCH (s:Satellite)<-[c:CREATED]-(u:User) RETURN s.satelliteName, c.createdAt ORDER BY c.createdAt DESC LIMIT 3',
};
