export default class LawfirmWebsiteDTO {

    vckey;
    title;
    intro;
    philosophy;
    about;
    active;
    acceptAppointments;

    constructor( data ) {
        if ( data ) {
            this.vckey = data.vckey;
            this.title = data.title;
            this.intro = data.intro;
            this.philosophy = data.philosophy;
            this.about = data.about;
            this.active = data.active;
            this.acceptAppointments = data.acceptAppointments;
        }
    }

}