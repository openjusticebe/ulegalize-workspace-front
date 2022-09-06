import axios from 'axios';

/**
 * get user LawyerDTO
 * @param accessToken
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function openMeeting( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/jitsi`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }

}export async function openMeetingEvent( accessToken, roomName, start, end ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/jitsi/event`, {
            params: {
                roomName: roomName,
                start: start,
                end: end,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }

}