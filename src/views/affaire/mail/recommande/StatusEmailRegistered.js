
export function getStatusEmailRegistered(status, label) {
    switch(status) {
        case '0':
            return label.mail.status30;
        case '10':
            return label.mail.status22;
        case '20':
            return label.mail.status23;
        case '30':
            return label.mail.status24;
        case '60':
            return label.mail.status25;
        case '70':
            return label.mail.status26;
        case '80':
            return label.mail.status27;
        case '55':
            return label.mail.status29;
        case '220':
            return label.mail.status28;
        default:
            return 'NA';
    }
}
