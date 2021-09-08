
export function getWorkflowNameLabel(code, label) {
    switch(code) {
        case 'U_SIGN':
            return label.payment.code1;
        case 'POST_BIRD':
            return label.payment.code2;
        case 'INVOICE':
            return label.payment.code3;
        case 'EMAIL_REGISTERED':
            return label.payment.code4;
        case '3':
        default:
            return 'NA';
    }
}
