export const UserNeoQueries = {
    /** params: username, toFollow */
    followUser:
        'MATCH (a:User {username: $username}), (b:User {username: $toFollow}) MERGE (a)-[follow:FOLLOWS {since: datetime()}]->(b)',
    /** params: username, toUnfollow */
    unfollowUser:
        'MATCH (a:User {username: $username})-[follow:FOLLOWS]->(b:User {username: $toUnfollow}) DELETE follow',
    /**
     * params: username
     *
     * returns follower
     */
    getFollowers: 'MATCH (a:User {username: $username})<-[follow:FOLLOWS]-(follower:User) RETURN follower',
    /**
     * params: username
     *
     * returns: following
     */
    getFollowing: 'MATCH (a:User {username: $username})-[follow:FOLLOWS]->(following:User) RETURN following',
    /**
     * params: username
     *
     * returns: user, followed, follow
     */
    getMostRecentlyFollowed:
        'MATCH (user:User)-[follow:FOLLOWS]->(followed:User) WHERE user.username in $list RETURN user, followed, follow ORDER BY follow.since DESC SKIP toInteger($skip) LIMIT toInteger($limit)',
};
