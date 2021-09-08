export default class FinanceDTO {

    couthoraire;
    honoraires;
    invoiced;
    prestations;
    fraisAdmin;
    debours;
    collaboration;
    tiersAccount;
    balance;

    constructor( data ) {
        if(data) {
            this.couthoraire = data.couthoraire;
            this.honoraires =  data.honoraires ;
            this.invoiced =  data.invoiced ;
            this.prestations =  data.prestations ;
            this.fraisAdmin =  data.fraisAdmin ;
            this.debours =  data.debours ;
            this.collaboration =  data.collaboration ;
            this.tiersAccount =  data.tiersAccount ;
            this.balance =  data.balance ;
        }
    }
}