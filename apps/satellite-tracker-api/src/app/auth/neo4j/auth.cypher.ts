export const AuthNeoQueries = {
    /**
     * params: username
     *
     * returns: user
     */
    addUser: 'MERGE (user:User {username: $username}) RETURN user',
    /** params: username */
    removeUser: 'MATCH (a:User {username: $username}) DETACH DELETE a',
    /**
     * params: username, newUsername
     *
     * returns: user
     */
    updateUsername: 'MATCH (user:User {username: $username}) SET a.username = $newUsername RETURN user',
};
