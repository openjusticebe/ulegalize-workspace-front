export default class PaymentDTO {

    id;
    status;
    amount;
    updUser;
    updDate;
    creUser;
    creDate;
    workflowNameCode;

    constructor( data ) {
        if(data) {
            this.id = data.id;
            this.status = data.status;
            this.amount = data.amount;
            this.updUser = data.updUser;
            this.updDate = data.updDate;
            this.creUser = data.creUser;
            this.creDate = data.creDate;
            this.workflowNameCode = data.workflowNameCode;
        }
    }
}
