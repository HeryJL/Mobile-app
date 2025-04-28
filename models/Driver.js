import User from './User';

class Driver extends User {
  constructor(id, email, password, firstName, lastName, phone, licenseNumber, carModel, carPlate, status = 'pending') {
    super(id, email, password, firstName, lastName, phone, 'driver');
    this.licenseNumber = licenseNumber;
    this.carModel = carModel;
    this.carPlate = carPlate;
    this.status = status; // 'pending', 'approved', 'rejected'
  }
}

export default Driver;