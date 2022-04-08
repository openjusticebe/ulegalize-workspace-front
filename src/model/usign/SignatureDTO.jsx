export default class SignatureDTO {

    usignId;
    status;
    vcKey;
    documentName;
    emailContent;
    signDate;
    createUser;
    createDate;
    enumUsignSequence;

    clientUsignDTOList
    constructor( data ) {
        if(data) {
            this.usignId = data.usignId;
            this.status = data.status;
            this.vcKey = data.vcKey;
            this.documentName = data.documentName;
            this.emailContent = data.emailContent;
            this.signDate = data.signDate;
            this.createUser = data.createUser;
            this.createDate = data.createDate;
            this.clientUsignDTOList = data.clientUsignDTOList;
            this.enumUsignSequence = data.enumUsignSequence;
        }
    }
}
