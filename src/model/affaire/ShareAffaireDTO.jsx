export default class ShareAffaireDTO {

    id;
    affaireId;
    vcKey;
    vcKeyItem;
    allMembers = true;
    userIdSelected;
    userId;
    userIdItem;
    enumVCOwner;

    userEmail;
    fullname;
    sharedDate;

    constructor( data ) {
        if(data) {
            this.id = data.id;
            this.affaireId = data.affaireId;
            this.vcKey = data.vcKey;
            this.vcKeyItem = data.vcKeyItem;
            this.allMembers =  data.allMembers ;
            this.userIdSelected =  data.userIdSelected ;
            this.userId =  data.userId ;
            this.enumVCOwner =  data.enumVCOwner ;
            this.userEmail =  data.userEmail ;
            this.fullname =  data.fullname ;
            this.sharedDate =  data.sharedDate ;
        }
    }
}