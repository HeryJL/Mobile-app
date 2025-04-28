import User from '../models/User';

const mockUsers = [
  new User('user1', 'alice@g.com', 'pass1', 'Alice', 'Dupont', '0321234567', 'passenger'),
  new User('user2', 'bob@example.com', 'pass2', 'Bob', 'Martin', '0339876543', 'passenger'),
  new User('user3', 'charlie@example.com', 'secure', 'Charlie', 'Tremblay', '0345551212', 'passenger'),
];

export default mockUsers;