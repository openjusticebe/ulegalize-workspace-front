export default class PriceDetail {
    name;
    sortOrder;
    timedNeeded;
    totalPriceExVat;
    totalPriceInVat;
    totalVat;
    unitPriceExVat;
    unitPriceInVat;
    vat;
    vatPercentage;

    constructor( data ) {
        this.name = data.name;
        this.sortOrder = data.sortOrder;
        this.timedNeeded = data.timedNeeded;
        this.totalPriceExVat = data.totalPriceExVat;
        this.totalPriceInVat = data.totalPriceInVat;
        this.totalVat = data.totalVat;
        this.unitPriceExVat = data.unitPriceExVat;
        this.unitPriceInVat = data.unitPriceInVat;
        this.vat = data.vat;
        this.vatPercentage = data.vatPercentage;
    }
}
