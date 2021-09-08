export default class SecurityGroupUserDTO {
    id;
    fullName;
    functionId;
    functionIdItem;
    securityGroupId;
    securityGroupItem;
    email;
    userEmailItem;
    shareDossier = true;
    valid;
    securityGroupDTOList;

    constructor( data ) {
        if(data) {
            this.id = data.id;
            this.alias = data.alias;
            this.idUser = data.idUser;
            this.fullName = data.fullName;
            this.initials = data.initials;
            this.summary = data.summary;
            this.biography = data.biography;
            this.specialities = data.specialities;
            this.color = data.color;
            this.picture = data.picture;
            this.functionId = data.functionId;
            this.functionIdItem = data.functionIdItem;
            this.securityGroupId = data.securityGroupId;
            this.securityGroupItem = data.securityGroupItem;
            this.email = data.email;
            this.userEmailItem = data.userEmailItem;
            this.phone = data.phone;
            this.language = data.language;
            this.shareDossier = data.shareDossier;
            this.valid = data.valid;
            this.securityGroupDTOList = data.securityGroupDTOList;
        }
    }
}
