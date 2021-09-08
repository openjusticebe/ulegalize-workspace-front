export default class CaseCreationDTO {
    dossier;
    contactSummaryList;

    constructor(dataDossier, dataClientList) {
        this.dossier = dataDossier;
        this.contactSummaryList = dataClientList;
    }
}