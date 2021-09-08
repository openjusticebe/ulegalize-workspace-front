
export default class ItemDTO {
    value;
    label;
    // only for front end
    isDefault;
    // only for front end
    email;

    constructor(dataGrid) {
        if(dataGrid) {
            this.value = dataGrid.value;
            this.label = dataGrid.label;
            this.isDefault = dataGrid.isDefault;
            this.email = dataGrid.email;
        }
    }
}