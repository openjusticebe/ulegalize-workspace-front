export default class InvoiceDTO {
    id;
    dossierId;
    dossierItem;
    vcKey;
    numFacture;
    yearFacture;
    reference;
    typeId;
    typeItem;
    montant;
    totalHonoraire;
    valid;
    dateValue;
    dateEcheance;
    posteId;
    posteItem;
    echeanceId;
    echeanceItem;
    clientId;
    clientItem;
    invoiceDetailsDTOList;
    prestationIdList;

    constructor( data ) {
        if ( data ) {
            this.id = data.id;
            this.dossierId = data.dossierId;
            this.dossierItem = data.dossierItem;
            this.vcKey = data.vcKey;
            this.numFacture = data.numFacture;
            this.yearFacture = data.yearFacture;
            this.reference = data.reference;
            this.typeId = data.typeId;
            this.typeItem = data.typeItem;
            this.montant = data.montant;
            this.totalHonoraire = data.totalHonoraire;
            this.valid = data.valid;
            this.dateValue = data.dateValue;
            this.dateEcheance = data.dateEcheance;
            this.posteId = data.posteId;
            this.posteItem = data.posteItem;
            this.echeanceId = data.echeanceId;
            this.echeanceItem = data.echeanceItem;
            this.clientId = data.clientId;
            this.clientItem = data.clientItem;
            this.invoiceDetailsDTOList = data.invoiceDetailsDTOList;
            this.prestationIdList = data.prestationIdList;
        }
    }

}
