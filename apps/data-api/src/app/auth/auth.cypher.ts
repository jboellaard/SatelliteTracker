export const AuthNeoQueries = {
    addUser: 'CREATE (a:User {username: $username})',
    removeUser: 'MATCH (a:User {username: $username}) DETACH DELETE a',
};
