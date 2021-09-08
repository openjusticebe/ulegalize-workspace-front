export default class SecurityGroupDTO {
    id;
    securityGroupId;
    securityGroupItem;
    description;
    appGroup;
    nbUsers;

    constructor( data ) {
        if(data) {
            this.id = data.id;
            this.securityGroupId = data.securityGroupId;
            this.securityGroupItem = data.securityGroupItem;
            this.description = data.description;
            this.appGroup = data.appGroup;
            this.nbUsers = data.nbUsers;
        }
    }
}
