
export default class ItemEventDTO {
    value;
    label;
    color;
    // only for front end
    isDefault = true;

    constructor(dataGrid) {
        if(dataGrid) {
            this.value = dataGrid.value;
            this.label = dataGrid.label;
            this.color = dataGrid.color;
        }
    }
}