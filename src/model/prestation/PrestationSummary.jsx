const padStart = require( 'lodash/padStart' );
export default class PrestationSummary {

    id;
    dossier;
    dossierId;
    dossierItem;
    idGest;
    idGestItem;
    tsType;
    tsTypeItem;
    tsTypeDescription;
    couthoraire;
    dateAction;
    dh;
    dm;
    time;
    comment;
    totalHt;
    totalTTC;
    vat;
    vatItem;
    forfait = false;
    forfaitHt;
    invoiceChecked;

    constructor( data ) {
        if ( data ) {
            this.id = data.id;
            this.dossier = data.dossier;
            this.dossierId = data.dossierId;
            this.dossierItem = data.dossierItem;
            this.idGest = data.idGest;
            this.idGestItem = data.idGestItem;
            this.tsType = data.tsType;
            this.tsTypeItem = data.tsTypeItem;
            this.tsTypeDescription = data.tsTypeDescription;
            this.couthoraire = data.couthoraire;
            this.dateAction = data.dateAction;
            this.dh = data.dh;
            this.dm = data.dm;
            this.time = data.dh + "H"+padStart(data.dm, 2 , '0');
            this.comment = data.comment;
            this.totalHt = data.totalHt;
            this.totalTTC = data.totalTTC;
            this.vat = data.vat;
            this.vatItem = data.vatItem;
            this.forfait = data.forfait;
            this.forfaitHt = data.forfaitHt;
            this.invoiceChecked = data.invoiceChecked;
        }
    }
}