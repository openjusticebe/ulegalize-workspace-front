export default class LawfirmConfigDTO {
   vc_key;
   parameter;
   description;

   constructor(data){
      if(data){
      this.vc_key = data.vc_key;
      this.parameter = data.parameter;
      this.description = data.description;
   }
   }
}