
export default class LawfirmDTO {
   //general
   vckey;
   abbreviation;
   email;
   numentreprise;
   objetsocial;
   currency;
   currencyItem;

   //adresse
   street;
   city;
   postalCode;

   countryCode;
   countryItem ;

   //contact
   phoneNumber;
   fax;
   website;

   //extra
   couthoraire;
   logo;
   driveType;

   name;
   alias;

   isNotification;

   constructor( data ) {
      if(data) {
          this.vckey = data.vckey ;
          this.name = data.name ;
          this.alias = data.alias ;
          this.abbreviation = data.abbreviation ;
          this.email = data.email ;
          this.numentreprise = data.numentreprise ;
          this.objetsocial = data.objetsocial ;
          this.currency = data.currency ;
          this.currencyItem = data.currencyItem ;

          this.street = data.street ;
          this.city = data.city ;
          this.postalCode = data.postalCode ;

          this.countryCode = data.countryCode;
			 this.countryItem = data.countryItem;

          this.phoneNumber = data.phoneNumber ;
          this.fax = data.fax ;
          this.website = data.website ;

          this.couthoraire = data.couthoraire ;
          this.logo = data.logo ;
          this.driveType = data.driveType ;
          this.isNotification = data.isNotification;
      }
  }
}