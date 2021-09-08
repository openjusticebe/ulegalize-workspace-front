export function getOptionInfoNotification(message) {
    return getOptionNotification(message, 'primary');
}
/**
type: 'primary', 'info', 'danger'
*/
export function getOptionNotification(message, type) {
    let options = {};
    options = {
    closeButton:true,
        place: 'tc',
        message: message,
        type: type,
        icon: 'tim-icons icon-bell-55',
        autoDismiss: 7
    };
    return options;
}