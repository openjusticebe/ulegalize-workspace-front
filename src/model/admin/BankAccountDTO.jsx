
export default class BankAccountDTO {
    compteId;
    vcKey;
    accountNumber;
    accountRef;
    accountTypeId;
    accountTypeIdItem;
    archived;

    constructor(data) {
        if(data) {
            this.accountNumber = data.accountNumber;
            this.vcKey = data.vcKey ;
            this.accountRef = data.accountRef;
            this.compteId = data.compteId;
            this.accountTypeId = data.accountTypeId;
            this.archived = data.archived ;
            this.accountTypeIdItem = data.accountTypeIdItem;
        }
    }
}