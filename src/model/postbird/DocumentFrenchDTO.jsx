import DocumentDTO from './DocumentDTO';

export default class DocumentFrenchDTO extends DocumentDTO {
    senderAddressLine1;
    senderAddressLine2;
    senderAddressLine3;
    senderAddressLine4;
    senderAddressLine5;
    senderAddressLine6;
    senderCountryCodeSender;
    countryCodeItemSender;
    senderCountryCodeRecipient;
    countryCodeItemRecipient;
    postageTpe;
    companyRecipient;
    documentAttachmentId;
    companySender;
    titleSender;
    firstnameSender;
    lastnameSender;
    residenceSender;
    streetAndNumberSender;
    citySender;
    postalCodeSender;
    bpSender;
    titleRecipient;
    firstnameRecipient;
    lastnameRecipient;
    residenceRecipient;
    streetAndNumberRecipient;
    cityRecipient;
    postalCodeRecipient;
    bpRecipient;
    optionalAddressSheet;

    constructor( data ) {
        super( data );
        if ( data ) {
            this.senderAddressLine1 = data.senderAddressLine1;
            this.senderAddressLine2 = data.senderAddressLine2;
            this.senderAddressLine3 = data.senderAddressLine3;
            this.senderAddressLine4 = data.senderAddressLine4;
            this.senderAddressLine5 = data.senderAddressLine5;
            this.senderAddressLine6 = data.senderAddressLine6;
            this.senderCountryCodeSender = data.senderCountryCodeSender;
            this.countryCodeItemSender = data.countryCodeItemSender;
            this.senderCountryCodeRecipient = data.senderCountryCodeRecipient;
            this.documentAttachmentId = data.documentAttachmentId;
            this.countryCodeItemRecipient = data.countryCodeItemRecipient;
            this.postageTpe = data.postageTpe;
            this.companyRecipient = data.companyRecipient;
            this.companySender = data.companySender;
            this.titleSender = data.titleSender;
            this.firstnameSender = data.firstnameSender;
            this.lastnameSender = data.lastnameSender;
            this.residenceSender = data.residenceSender;
            this.streetAndNumberSender = data.streetAndNumberSender;
            this.bpSender = data.bpSender;
            this.citySender = data.citySender;
            this.postalCodeSender = data.postalCodeSender;
            this.titleRecipient = data.titleRecipient;
            this.firstnameRecipient = data.firstnameRecipient;
            this.lastnameRecipient = data.lastnameRecipient;
            this.residenceRecipient = data.residenceRecipient;
            this.streetAndNumberRecipient = data.streetAndNumberRecipient;
            this.bpRecipient = data.bpRecipient;
            this.cityRecipient = data.cityRecipient;
            this.postalCodeRecipient = data.postalCodeRecipient;
            this.optionalAddressSheet = data.optionalAddressSheet;
        }
    }
}
