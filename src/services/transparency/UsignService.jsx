import axios from 'axios';

export async function getUsignByVcKey( accessToken, offset, limit ) {
    try {

        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/usign`, {
            params: { offset: offset, limit: limit },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}
export async function getUsignById( accessToken, usignId) {
    try {

        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/usign/${usignId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function attachEsignDocumentByVcKey( accessToken, files ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/usign/connective/document`,
                files,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
