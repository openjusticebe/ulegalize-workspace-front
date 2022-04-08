import axios from 'axios';
import DocumentDTO from '../model/postbird/DocumentDTO';

export async function sendTemporaryDocument( accessToken, file ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird`,
            file,
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

export async function updateAddress( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}`,
            new DocumentDTO(document),
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
export async function updateSendingOptions( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/sendOption/${documentId}`,
            new DocumentDTO(document),
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

export async function payDocument( accessToken , documentId) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}/payment`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( (e) => {
            return {error:true, data: e.response.status}
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function getTotalCost( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}/cost/total`,
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
export async function getStatus( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}/status`,
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
export async function getBPostStatus( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}/BpostStatus`,
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
export async function getDocumentById( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}`,
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
export async function getDocumentsMail( accessToken , offset, limit, dossierId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/list`,
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
export async function generateMail( accessToken, documentId ) {
    try {
        return axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}/pdf`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error:true}
        });
    } catch ( e ) {
        return { error: true, data: {}};
    }
}

export async function getCountryCodes( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/countryCodes`,
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
export async function deleteDocumentById( accessToken , documentId) {
    try {
        return await axios.delete( `${process.env.REACT_APP_PAYMENT_SERVER}v1/postBird/${documentId}`,
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