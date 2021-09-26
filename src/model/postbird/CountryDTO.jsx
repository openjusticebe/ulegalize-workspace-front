export default class CountryDTO {
    name;
    iso2;
    iso3;

    constructor( data ) {
        if(data) {
            this.name = data.name;
            this.iso2 = data.iso2;
            this.iso3 = data.iso3;
        }
    }
}
