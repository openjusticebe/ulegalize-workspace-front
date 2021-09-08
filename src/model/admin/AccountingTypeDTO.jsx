
export default class AccountingTypeDTO {
    accountingId;
    vcKey;
    description;
    userUpd;
    dateUpd;
    archived;

    fraisProcedure;
    honoraires;
    fraisCollaboration;
    facturable;

    constructor(data) {
        if(data) {
            this.accountingId = data.accountingId;
            this.idTs  = data.idTs ;
            this.vcKey = data.vcKey ;
            this.description = data.description ;
            this.userUpd = data.userUpd ;
            this.dateUpd = data.dateUpd ;
            this.archived = data.archived ;
            this.fraisProcedure = data.fraisProcedure ;
            this.honoraires = data.honoraires ;
            this.fraisCollaboration = data.fraisCollaboration ;
            this.facturable = data.facturable ;
        }
    }
}