export default class AdminDTO {
    id;
    title;
    introduction;
    philosophy;
    extra;
    contact;
    isMeeting;
    isActivate;
    website;

    constructor( data ) {
        if(data) {
            this.id = data.id ;
            this.title = data.title ;
            this.introduction = data.introduction ;
            this.philosophy = data.philosophy ;
            this.extra = data.extra ;
            this.contact = data.contact ;
            this.isMeeting = data.isMeeting ;
            this.isActivate = data.isActivate ;
            this.website = data.website ;
        }
    }
}