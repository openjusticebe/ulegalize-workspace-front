export default class CaseCreationDTO {
    dossier;
    contactSummaryList;
    // create affaire
    contact;

    constructor(dataDossier, dataClientList, contact) {
        this.dossier = dataDossier;
        this.contactSummaryList = dataClientList;
        this.contact = contact;
    }
}