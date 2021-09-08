import axios from 'axios';

export async function sendEmailRegistered( accessToken, formData ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/emailRegistered/send`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}
export async function getEMailRegisteredList( accessToken , offset, limit, dossierId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/emailRegistered/list`,
            {
                params: {
                    dossierId: dossierId,
                    offset: offset,
                    limit: limit
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}