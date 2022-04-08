
export function getStatusPostBird(status, label) {
    switch(status) {
        case '0':
            return label.mail.status0;
        case '1':
            return label.mail.status1;
        case '2':
            return label.mail.status2;
        case '3':
            return label.mail.status3;
        case '4':
            return label.mail.status4;
        case '5':
            return label.mail.status5;
        case '6':
            return label.mail.status6;
        case '7':
            return label.mail.status7;
        case '8':
            return label.mail.status8;
        case '9':
            return label.mail.status9;
        case '10':
            return label.mail.status10;
        case '11':
            return label.mail.status11;
        case '12':
            return label.mail.status12;
        case '13':
            return label.mail.status13;
        case '14':
            return label.mail.status14;
        case '15':
            return label.mail.status15;
        case '16':
            return label.mail.status16;
        case '17':
            return label.mail.status17;
        case '18':
            return label.mail.status18;
        case '19':
            return label.mail.status19;
        case '99':
            return label.mail.status20;
        case '21':
            return label.mail.status21;
        default:
            return 'NA';
    }
}
