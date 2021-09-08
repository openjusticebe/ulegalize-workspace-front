export default class InvoiceDetailsDTO {

    id;
    factureId;
    description;

    tva;
    tvaItem;

    montant;
    montantHt;
    index = 0;

    constructor( data ) {
        if ( data ) {
            this.id = data.id;
            this.factureId = data.factureId;
            this.description = data.description;

            this.tva = data.tva;
            this.tvaItem = data.tvaItem;

            this.montant = data.montant;
            this.montantHt = data.montantHt;
        }
    }
}
