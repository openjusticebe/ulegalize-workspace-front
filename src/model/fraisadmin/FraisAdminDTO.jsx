export default class FraisAdminDTO {

    id;
    type;
    archived;
    idDoss;
    idUserResponsible;

    idDebourType;
    idDebourTypeItem;
    idMesureType;
    idMesureTypeItem;
    unit;
    mesureDescription;
    debourDescription;
    pricePerUnit;
    dateAction;
    comment;

    // not used in the backend
    costCalculated;
    invoiceChecked;
    alreadyInvoiced;
    factExtId;
    factExtRef;

    constructor( data ) {
        if ( data ) {
            this.id = data.id;
            this.type = data.type;
            this.archived = data.archived;
            this.idDoss = data.idDoss;
            this.dossierItem = data.dossierItem;
            this.idUserResponsible = data.idUserResponsible;

            this.idDebourType = data.idDebourType;
            this.idDebourTypeItem = data.idDebourTypeItem;
            this.idMesureType = data.idMesureType;
            this.idMesureTypeItem = data.idMesureTypeItem;
            this.mesureDescription = data.mesureDescription;
            this.unit = data.unit;
            this.debourDescription = data.debourDescription;
            this.pricePerUnit = data.pricePerUnit;
            this.dateAction = data.dateAction;
            this.comment = data.comment;
            this.invoiceChecked = data.invoiceChecked;
            this.alreadyInvoiced = data.alreadyInvoiced;
            this.factExtId = data.factExtId;
            this.factExtRef = data.factExtRef;
        }
    }
}