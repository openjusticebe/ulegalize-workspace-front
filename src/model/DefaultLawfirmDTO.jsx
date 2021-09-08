export default class DefaultLawfirmDTO {
    vcKey;
    language;
    lawfirmDTO;
    itemVatDTOList;

    constructor( data) {
        if(data) {

        this.vcKey = data.vcKey;
        this.language = data.language;
        this.lawfirmDTO = data.lawfirmDTO;
        this.itemVatDTOList = data.itemVatDTOList;
        }
    }

}
