class User {
    constructor(id, email, password, firstName, lastName, phone, userType) {
      this.id = id;
      this.email = email;
      this.password = password; // Attention : ne stockez jamais les mots de passe en clair en production !
      this.firstName = firstName;
      this.lastName = lastName;
      this.phone = phone;
      this.userType = userType; // 'passenger'
    }
  }
  
  export default User;