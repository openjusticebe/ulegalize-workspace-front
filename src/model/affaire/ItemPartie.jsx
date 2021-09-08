export default class ItemPartie {
    _id;
    id;
    label;
    email;
    emailItem;
    function;
    functionItem;
    type;
    litigant;
    vcKey;

    constructor( data ) {
        if ( data ) {
            this._id = data._id;
            this.id = data.id;
            this.label = data.label;
            this.email = data.email;
            this.emailItem = data.emailItem;
            this.function = data.function;
            this.functionItem = data.functionItem;
            this.type = data.type;
            this.litigant = data.litigant;
        }
    }

}
