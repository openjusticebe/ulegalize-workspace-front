export default class LawfirmDriveDTO {
   driveType;
    dropboxToken;

   constructor( data ) {
      if(data) {
          this.driveType = data.driveType ;
          this.dropboxToken = data.dropboxToken ;
      }
  }
}