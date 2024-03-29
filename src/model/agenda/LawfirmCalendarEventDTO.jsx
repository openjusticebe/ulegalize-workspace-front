import ItemEventDTO from './ItemEventDTO';

let moment = require( 'moment-timezone' );

moment.tz.setDefault( 'Europe/Brussels' );
export default class LawfirmCalendarEventDTO {
    id;
    eventType = "PERM";
    eventTypeItem = new ItemEventDTO();
    start;
    end;
    note = "";
    location;
    contact_id;
    contactItem;
    approved;
    title;
    dossier_id;
    dossierItem;
    user_id;
    userItem;
    color = "";
    participantsEmail;
    pathFile;
    microText;
    audioText;
    speechToTextActivated = false;
    roomAttached = false;
    urlRoom ;
    // use in v1
    contact;
    dossier;

    constructor( data ) {
        if ( data ) {
            this.contact = data.contact;
            this.dossier = data.dossier;
            this.id = data.id;
            this.note = data.note;
            this.title = data.title;
            this.approved = data.approved;
            this.contact_id = data.contact_id;
            this.contactItem = data.contactItem;
            this.user_id = data.user_id;
            this.userItem = data.userItem;
            this.location = data.location;
            this.dossier_id = data.dossier_id;
            this.dossierItem = data.dossierItem;
            this.eventType = data.eventType;
            this.eventTypeItem = data.eventTypeItem;
            this.color = data.color;
            this.participantsEmail = data.participantsEmail;
            this.participantsEmailItem = data.participantsEmailItem;
            this.pathFile = data.pathFile;
            this.microText = data.microText;
            this.audioText = data.audioText;
            this.speechToTextActivated = data.speechToTextActivated;
            this.roomAttached = data.roomAttached;
            this.urlRoom = data.urlRoom;
            this.start = moment(data.start).toDate();
            this.end = moment(data.end).toDate();
        }
    }
}