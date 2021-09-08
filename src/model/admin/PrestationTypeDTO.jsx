
export default class PrestationTypeDTO {
   idTs;
    vcKey;
    description;
    userUpd;
    dateUpd;
    archived;

    constructor(data) {
        if(data) {
            this.idTs  = data.idTs ;
            this.vcKey = data.vcKey ;
            this.description = data.description ;
            this.userUpd = data.userUpd ;
            this.dateUpd = data.dateUpd ;
            this.archived = data.archived ;
        }
    }
}