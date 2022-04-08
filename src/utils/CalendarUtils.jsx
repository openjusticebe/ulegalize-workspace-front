import LawfirmCalendarEventDTO from '../model/agenda/LawfirmCalendarEventDTO';
const isNil = require( 'lodash/isNil' );

export const newEvent = ( event = new LawfirmCalendarEventDTO(), start, end, userId, calendarTypeList, userResponsableList, dossierItem ) => {
    let eventLocal = event;
    eventLocal.start = start;
    eventLocal.end = end;
    eventLocal.user_id = userId;
    eventLocal.eventTypeItem = calendarTypeList[ 0 ];
    eventLocal.eventType = calendarTypeList[ 0 ].value;

    eventLocal.userItem = userResponsableList.find( user => user.value === eventLocal.user_id );
    if ( !isNil( dossierItem ) ) {
        eventLocal.dossier_id = dossierItem.value;
        eventLocal.dossierItem = dossierItem;
    }

    return eventLocal;

}