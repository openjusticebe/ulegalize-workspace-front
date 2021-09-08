export default class MesureTypeDTO {
  id;
  value;
  label;
  
  constructor(data) {
    if (data) {
      this.id = data.id;
      this.value = data.value;
      this.label = data.label;
    }
  }
}
