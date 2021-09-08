let moment = require( 'moment-timezone' );

export function getDate(dateString) {
    return moment.utc( dateString ).tz( 'Europe/Brussels' ).format( 'YYYY-MM-DD' );
}
export function getDateDetails(dateString) {
    return moment( dateString ).tz( 'Europe/Brussels' ).format( 'YYYY-MM-DD HH:mm' );
}
//export function getDateToDate(dateString) {
//    return getDate(dateString).toDate();
//}