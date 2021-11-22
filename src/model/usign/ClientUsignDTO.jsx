export default class ClientUsignDTO {
    birthdate = '';
    id;
    fullName = '';
    email = '';
    phone;
    firstname = '';
    lastname = '';
    left = 0;
    top = 0;

    width = 160;
    height = 80;
    pageNumber = 1;
    sequence = 1;

    constructor( profile ) {
        if ( profile ) {
            this.birthdate = profile.birthdate;
            this.id = profile.id;
            this.fullName = profile.fullName;
            this.email = profile.email;
            this.phone = profile.phone;
            this.firstname = profile.firstname;
            this.lastname = profile.lastname;
            this.left = profile.left;
            this.top = profile.top;
            this.width = profile.width;
            this.height = profile.height;
            this.pageNumber = profile.pageNumber;
            this.sequence = profile.sequence;

        }
    }
}
