import axios from 'axios';
import { getClient } from './ClientService';
import LawfirmCalendarEventDTO from '../model/agenda/LawfirmCalendarEventDTO';
const forEach = require( 'lodash/forEach' );

export async function fetchLawfirmCalendar( accessToken, vckeySelected, callback, callbackContact ) {
    try {

        return await axios.all( [
            getClient(accessToken, "", vckeySelected)
        ] )
        .then(
            axios.spread( ( lawfirm, contacts ) => {
                callback( lawfirm.data );
                callbackContact( contacts.data );
            } ) )
        .catch( exception => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function countUnapprovedAgenda( accessToken, filter , vckeySelected) {
    try {
        let params = new URLSearchParams();
        params.append("userId", filter ? filter.userId : null);

        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/calendar/events/unapproved`, {
            params: {
                vcKey: vckeySelected,
                userId:filter ? filter.userId : null
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: 0 };
        } );
    } catch ( e ) {
        return { error: true, data: 0 };
    }
}

export async function getAgenda( accessToken, start, end, filter ) {
    try {
        let params = new URLSearchParams();
        const types = filter ? forEach(filter.eventTypesSelected, type=>{
            params.append("eventTypesSelected", type);
        }) : null;
        params.append("userId", filter ? filter.userId : null);

        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/calendar/events`, {
            params: {
                start: start,
                end: end,
                dossierId:filter ? filter.dossierId : null,
                userId:filter && filter.userId ? filter.userId : 0,
                eventTypesSelected: types + '',
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function createEvent(accessToken, event) {
    try {
        return axios.post(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/calendar/events`,
            new LawfirmCalendarEventDTO(event),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}
export async function updateEvent(accessToken, eventId,  event) {
    try {
        return axios.put(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/calendar/events/${eventId}`,
            new LawfirmCalendarEventDTO(event),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function approvedEvent(accessToken, eventId) {
    try {
        return axios.put(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/calendar/events/${eventId}/approved`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function deleteEvent(accessToken, eventId) {
    try {
        return axios.delete(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/calendar/events/${eventId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}