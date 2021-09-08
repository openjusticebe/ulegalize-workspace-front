export default class InboxDTO {
    id;
    filename;
    recDate;

    constructor(data) {
        if(data) {
            this.id = data.id;
            this.filename = data.filename;
            this.recDate = data.recDate;

        }
    }


}
