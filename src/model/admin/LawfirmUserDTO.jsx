export default class LawfirmUserDTO {
  id;
  email;
  isPublic;
  
  constructor(data) {
    if (data) {
      this.id = data.id;
      this.email = data.email;
      this.isPublic = data.isPublic;
    }
  }
}
