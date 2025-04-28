import Driver from '../models/Driver';

const mockDrivers = [
  new Driver('driver1', 'driver.com', 'pass', 'David', 'Lefevre', '0381122334', 'ABC-123', 'Toyota', 'XYZ-789', 'approved'),
  new Driver('driver2', 'eve@example.com', 'dpass2', 'Eve', 'Roy', '0376543210', 'DEF-456', 'Honda', 'UVW-012', 'pending'),
  new Driver('driver3', 'frank@example.com', 'safe', 'Frank', 'Gagnon', '0369998877', 'GHI-789', 'BMW', 'RST-345', 'approved'),
];

export default mockDrivers;