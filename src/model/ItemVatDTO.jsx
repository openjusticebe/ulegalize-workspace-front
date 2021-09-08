
export default class ItemVatDTO {
    value;
    label;

    constructor(dataGrid) {
        if(dataGrid) {
            this.id = dataGrid.id;
            this.vat = dataGrid.vat;
        }
    }
}
