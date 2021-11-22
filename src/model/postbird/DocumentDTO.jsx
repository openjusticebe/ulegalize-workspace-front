export default class DocumentDTO {

    documentId;
    dossierId;
    base64DocumentContent;
    documentName;
    status;
    creDate;
    city;
    countryCode;
    countryCodeItem;
    postalCode;
    recipientName;
    streetAndNumber;
    sendMethod;
    // option
    prior;
    registered;
    twoSided = true;
    color;
    trackingCode;

    constructor( data ) {
        if(data) {
            this.documentId = data.documentId;
            this.dossierId = data.dossierId;
            this.base64DocumentContent = data.base64DocumentContent;
            this.documentName = data.documentName;
            this.status = data.status;
            this.creDate = data.creDate;
            this.city = data.city;
            this.countryCode = data.countryCode;
            this.countryCodeItem = data.countryCodeItem;
            this.postalCode = data.postalCode;
            this.recipientName = data.recipientName;
            this.streetAndNumber = data.streetAndNumber;
            this.sendMethod = data.sendMethod;
            this.prior = data.prior;
            this.registered = data.registered;
            this.twoSided = data.twoSided;
            this.color = data.color;
            this.trackingCode = data.trackingCode;
        }
    }
}
