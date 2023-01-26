export const AuthNeoQueries = {
    addUser: 'MERGE (user:User {username: $username}) RETURN user',
    removeUser: 'MATCH (a:User {username: $username}) DETACH DELETE a',
    updateUsername: 'MATCH (user:User {username: $username}) SET a.username = $newUsername RETURN user',
};
