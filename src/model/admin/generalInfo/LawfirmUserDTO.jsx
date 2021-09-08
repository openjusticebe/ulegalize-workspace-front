export default class LawfirmUserDTO {

    id;
    public;
    isSelected;
    active;
    couthoraire;
    useSelfCouthoraire;
    isPrestataire;
    validFrom;
    validTo;
    idRole;
    lawyerAlias;
    email;

    constructor( data ) {

        if ( data ) {
            this.id = data.id;
            this.public = data.public;
            this.isSelected = data.isSelected;
            this.active = data.active;
            this.couthoraire = data.couthoraire;
            this.useSelfCouthoraire = data.useSelfCouthoraire;
            this.isPrestataire = data.isPrestataire;
            this.validFrom = data.validFrom;
            this.validTo = data.validTo;
            this.idRole = data.idRole;
            this.lawyerAlias = data.lawyerAlias;
            this.email = data.email;
        }

    }
}