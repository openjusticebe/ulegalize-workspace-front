
export function getStatusBPostPostBird(status, label) {
    switch(status) {
        case '0':
            return label.mail.bpoststatus0;
        case '1':
            return label.mail.bpoststatus1;
        case '2':
            return label.mail.bpoststatus2;
        case '3':
            return label.mail.bpoststatus3;
        case '4':
            return label.mail.bpoststatus4;
        default:
            // 0 unknown
            return label.mail.bpoststatus0;
    }
}
