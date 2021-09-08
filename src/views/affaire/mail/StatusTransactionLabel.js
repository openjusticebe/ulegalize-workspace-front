
export function getStatusTransaction(code, label) {
    switch(code) {
        case 'INITIATED':
            return label.payment.initiated;
        case 'PAYED':
            return label.payment.payed;
        case 'NOT_PAYED':
            return label.payment.not_payed;
        case 'DUE_DATE':
            return label.payment.due_date;
        case 'SUSPENDED':
            return label.payment.suspended;
        case '3':
        default:
            return 'NA';
    }
}
