export default class CardsDTO {
    paymentMethodId;
    name;
    brand;
    country;
    customerId;
    cvc_check;
    exp_month;
    exp_year;
    funding;
    last4;

    constructor( data ) {
        if ( data ) {
            this.paymentMethodId = data.paymentMethodId;
            this.name = data.name;
            this.brand = data.brand;
            this.country = data.country;
            this.customerId = data.customerId;
            this.cvc_check = data.cvc_check;
            this.exp_month = data.exp_month;
            this.exp_year = data.exp_year;
            this.funding = data.funding;
            this.last4 = data.last4;
        }

    }
}
