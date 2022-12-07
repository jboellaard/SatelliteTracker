export const AuthNeoQueries = {
    addUserWithLocation: 'CREATE (a:User {username: $username, longitude: $longitude, latitude: $latitude } ) RETURN a',
    addUser: 'CREATE (a:User {username: $username}) RETURN a',
    removeUser: 'MATCH (a:User {username: $username}) DETACH DELETE a',
};
