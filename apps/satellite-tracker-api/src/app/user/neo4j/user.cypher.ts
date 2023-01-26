export const UserNeoQueries = {
    followUser:
        'MATCH (a:User {username: $username}), (b:User {username: $toFollow}) MERGE (a)-[follow:FOLLOWS {since: datetime()}]->(b)',
    unfollowUser:
        'MATCH (a:User {username: $username})-[follow:FOLLOWS]->(b:User {username: $toUnfollow}) DELETE follow',
    getFollowers: 'MATCH (a:User {username: $username})<-[follow:FOLLOWS]-(user:User) RETURN user',
    getFollowing: 'MATCH (a:User {username: $username})-[follow:FOLLOWS]->(user:User) RETURN user',
    getMostRecentlyFollowed:
        'MATCH (user:User)-[follow:FOLLOWS]->(followed:User) WHERE user.username in $list RETURN user, followed, follow ORDER BY follow.since DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
};
