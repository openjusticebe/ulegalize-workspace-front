export default class DossierDTO {
    id;
    label = '';
    fullnameDossier = '';
    year = '';
    num = '';
    note = '';
    openDossier = new Date();
    closeDossier;
    type ;
    typeItem ;

    isOwner;
    vckeyOwner;

    idUserResponsible;
    userResponsible;

    idClient;
    client;
    idAdverseClient;
    clientList = [];

    adverseFirstnameClient;
    adverseLastnameClient;
    firstnameClient;
    lastnameClient;
    birthdateClient;

    adverseIdClient;
    adverseClient;
    conseilIdAdverseClient;
    conseilAdverseClient;

    id_matiere_rubrique;
    matiere_rubrique;

    keywords = '';
    memo = '';
    quality = '';
    success_fee_perc = 100;
    success_fee_montant = 0;
    couthoraire;
    emailClient;
    isDigital = false;
    balance;

    constructor( data ) {
        if ( data ) {
            this.id = data.id;
            this.label = data.label;
            this.fullnameDossier = data.fullnameDossier;
            this.year = data.year;
            this.num = data.num;
            this.note = data.note;
            this.openDossier = new Date( data.openDossier );
            this.closeDossier = data.closeDossier ? new Date( data.closeDossier ) : null;
            this.type = data.type;
            this.typeItem = data.typeItem;

            this.isOwner = data.isOwner;
            this.vckeyOwner = data.vckeyOwner;
            this.idUserResponsible = data.idUserResponsible;
            this.idClient = data.idClient;
            this.client = data.client;
            this.idAdverseClient = data.idAdverseClient;
            this.clientList = data.clientList;

            this.firstnameClient = data.firstnameClient;
            this.lastnameClient = data.lastnameClient;
            this.birthdateClient = data.birthdateClient;
            this.adverseFirstnameClient = data.adverseFirstnameClient;
            this.adverseLastnameClient = data.adverseLastnameClient;
            this.adverseIdClient = data.adverseIdClient;
            this.adverseClient = data.adverseClient;
            this.conseilIdAdverseClient = data.conseilIdAdverseClient;
            this.conseilAdverseClient = data.conseilAdverseClient;
            this.id_matiere_rubrique = data.id_matiere_rubrique;
            this.matiere_rubrique = data.matiere_rubrique;
            this.keywords = data.keywords;
            this.memo = data.memo;
            this.quality = data.quality;
            this.success_fee_perc = data.success_fee_perc;
            this.success_fee_montant = data.success_fee_montant;
            this.couthoraire = data.couthoraire;
            this.emailClient = data.emailClient;
            this.isDigital = data.isDigital;
            this.balance = data.balance;
        }
    }
}