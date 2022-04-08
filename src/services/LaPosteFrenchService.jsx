import axios from 'axios';
import DocumentFrenchDTO from '../model/postbird/DocumentFrenchDTO';
import AddressRecipientDTO from '../model/postbird/AddressRecipientDTO';

export async function getAllDocument( accessToken,documentId, callback, callbackAddress ) {

    return await axios.all( [
        getDocumentById( accessToken, documentId),
        getAddressRecipient( accessToken, documentId ),

    ] )
    .then(
        axios.spread( ( affaires, sharedAffaires ) => {
            callback( affaires.data );
            callbackAddress( sharedAffaires.data );
        } ) )
    .catch( exception => {

    } );
}

export async function addDocument( accessToken, documentId, file ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}/documents`,
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

}export async function createDraft( accessToken, document ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench`,
            new DocumentFrenchDTO(document),
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
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/address/${documentId}`,
            new DocumentFrenchDTO(document),
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
export async function updateEnvelope( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/sendOption/${documentId}`,
            new DocumentFrenchDTO(document),
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
export async function saveAddressEnvelope( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/address/${documentId}`,
            new AddressRecipientDTO(document),
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
export async function updateAddressEnvelope( accessToken , documentId,recipientId, document) {
    try {
        return await axios.put( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/address/${documentId}/recipient/${recipientId}`,
            new AddressRecipientDTO(document),
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
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}/payment`,
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
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}/cost/total`,
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
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}/status`,
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
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}`,
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
export async function getAddressRecipient( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/address/${documentId}`,
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
export async function getDocumentByDefault( accessToken, dossierId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/default`,
            {
                params: {
                    dossierId: dossierId,
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
export async function getDocumentsMail( accessToken , offset, limit, dossierId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/list`,
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
        return axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}/pdf`, {
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
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/countryCodes`,
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
        return await axios.delete( `${process.env.REACT_APP_PAYMENT_SERVER}v1/laPosteFrench/${documentId}`,
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