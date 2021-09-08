export default class EmailDTO {
    id;
    dossierId;
    vcKey;
    message_body;
    sender_email;
    subject;
    sender_real_name;
    recipient_email;
    recipient_language;
    creDate;
    statusCode;
    constructor( data ) {
        if(data) {
            this.id = data.id;
            this.dossierId = data.dossierId;
            this.vcKey = data.vcKey;
            this.message_body = data.message_body;
            this.sender_email = data.sender_email;
            this.subject = data.subject;
            this.sender_real_name = data.sender_real_name;
            this.recipient_email = data.recipient_email;
            this.recipient_language = data.recipient_language;
            this.creDate = data.creDate;
            this.statusCode = data.statusCode;
        }
    }
}
