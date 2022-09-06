export default class AddressRecipientDTO {
    vcKey;
    username;
    dossierId;
    dossierPath;
    documentId;
    recipientId;
    senderCountryCodeRecipient;
    countryCodeItemRecipient;
    postageTpe;
    companyRecipient;
    addressLine2;
    residenceRecipient;
    streetAndNumberRecipient;
    bpRecipient;
    cityRecipient;
    postalCodeRecipient;
    constructor( {
                     vcKey,
                     username,
                     dossierId,
                     dossierPath,
                     documentId,
                     recipientId,
                     senderCountryCodeRecipient,
                     countryCodeItemRecipient,
                     postageTpe,
                     companyRecipient,
                     addressLine2,
                     residenceRecipient,
                     streetAndNumberRecipient,
                     bpRecipient,
                     cityRecipient,
                     postalCodeRecipient
                 } ) {
        this.vcKey = vcKey;
        this.username = username;
        this.dossierId = dossierId;
        this.dossierPath = dossierPath;
        this.documentId = documentId;
        this.recipientId = recipientId;
        this.senderCountryCodeRecipient = senderCountryCodeRecipient;
        this.countryCodeItemRecipient = countryCodeItemRecipient;
        this.postageTpe = postageTpe;
        this.companyRecipient = companyRecipient;
        this.addressLine2 = addressLine2;
        this.residenceRecipient = residenceRecipient;
        this.streetAndNumberRecipient = streetAndNumberRecipient;
        this.bpRecipient = bpRecipient;
        this.cityRecipient = cityRecipient;
        this.postalCodeRecipient = postalCodeRecipient;
    }

}
