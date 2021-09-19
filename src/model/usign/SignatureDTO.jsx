export default class SignatureDTO {

    usignId;
    status;
    vcKey;
    documentName;
    signDate;
    createUser;
    createDate;

    constructor( data ) {
        if(data) {
            this.usignId = data.usignId;
            this.status = data.status;
            this.vcKey = data.vcKey;
            this.documentName = data.documentName;
            this.signDate = data.signDate;
            this.createUser = data.createUser;
            this.createDate = data.createDate;
        }
    }
}
