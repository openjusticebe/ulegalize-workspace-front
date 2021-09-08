
export default class ComptaDTO {
    montantHt;
    id;
    idType;
    idTypeItem;
    idCompte;
    compte;
    dateValue;
    montant;

    idTransaction;
    ratio;
    gridId ;
    idPost;
    idUser;
    idUserItem;
    idDoss;
    idDossierItem;
    idFacture;
    idFactureItem;
    memo;
    poste;
    tiersFullname;

        constructor(data) {

            this.id = data.id;
            this.idType = data.idType;
            this.idTypeItem = data.idTypeItem;
            this.idCompte = data.idCompte;
            this.dateValue = data.dateValue;
            this.montant = data.montant;
            this.montantHt = data.montantHt;
            this.idTransaction = data.idTransaction;
            this.ratio = data.ratio;
            this.gridId = data.gridId;
            this.idPost = data.idPost;
            this.idUser = data.idUser;
            this.idUserItem = data.idUserItem;
            this.idDoss = data.idDoss;
            this.idDossierItem = data.idDossierItem;
            this.idFacture = data.idFacture;
            this.idFactureItem = data.idFactureItem;
            this.memo = data.memo;
            this.poste = data.poste;
            this.tiersFullname = data.tiersFullname;

    }
}