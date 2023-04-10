export const AuthNeoQueries = {
    /**
     * params: username
     *
     * returns: user
     */
    addUser: 'CREATE (user:User {username: $username}) RETURN user',
    /** params: username */
    removeUser: 'MATCH (a:User {username: $username}) OPTIONAL MATCH (a)-[:CREATED]->(s) DETACH DELETE a, s',
    /**
     * params: username, newUsername
     *
     * returns: user
     */
    updateUsername: 'MATCH (user:User {username: $username}) SET a.username = $newUsername RETURN user',
};
