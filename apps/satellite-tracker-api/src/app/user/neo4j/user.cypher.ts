export const UserNeoQueries = {
    followUser:
        'MATCH (a:User {username: $username}), (b:User {username: $username}) MERGE (a)-[follow:FOLLOWS {since: $now])}]->(b)',
    unfollowUser: 'MATCH (a:User {username: $username})-[follow:FOLLOWS]->(b:User {username: $username}) DELETE follow',
    trackSatellite:
        'MATCH (a:User {username: $username}), (b:Satellite {id: $id}) MERGE (a)-[track:TRACKS {since: $now}]->(b)',
    untrackSatellite: 'MATCH (a:User {username: $username})-[track:TRACKS]->(b:Satellite {id: $id}) DELETE track',
};
