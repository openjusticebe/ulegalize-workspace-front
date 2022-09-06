import axios from 'axios';
import DocumentFrenchDTO from '../model/postbird/DocumentFrenchDTO';
import AddressRecipientDTO from '../model/postbird/AddressRecipientDTO';

export async function getAllDocumentLrel( accessToken, documentId, callback, callbackAddress ) {

    return await axios.all( [
        getDocumentLrelById( accessToken, documentId),
        getAddressRecipientLrel( accessToken, documentId ),

    ] )
    .then(
        axios.spread( ( affaires, sharedAffaires ) => {
            callback( affaires.data );
            callbackAddress( sharedAffaires.data );
        } ) )
    .catch( exception => {

    } );
}

export async function addDocumentLrel( accessToken, documentId, file ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}/documents`,
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

}export async function createDraftLrel( accessToken, document ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench`,
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

export async function updateAddressLrel( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/address/${documentId}`,
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
export async function updateEnvelopeLrel( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/sendOption/${documentId}`,
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
export async function saveAddressEnvelopeLrel( accessToken , documentId, document) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/address/${documentId}`,
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
export async function updateAddressEnvelopeLrel( accessToken , documentId, recipientId, document) {
    try {
        return await axios.put( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/address/${documentId}/recipient/${recipientId}`,
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

export async function payDocumentLrel( accessToken , documentId) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}/payment`,
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

export async function getTotalCostLrel( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}/cost/total`,
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
export async function getStatusLrel( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}/status`,
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
export async function getDocumentLrelById( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}`,
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
export async function getAddressRecipientLrel( accessToken , documentId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/address/${documentId}`,
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
export async function getDocumentLrelByDefault( accessToken, dossierId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/default`,
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
export async function getDocumentsMailLrel( accessToken , offset, limit, dossierId) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/list`,
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
export async function generateMailLrel( accessToken, documentId ) {
    try {
        return axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}/pdf`, {
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

export async function getCountryCodesLrel( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/countryCodes`,
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
export async function deleteDocumentLrelById( accessToken , documentId) {
    try {
        return await axios.delete( `${process.env.REACT_APP_PAYMENT_SERVER}v1/registered/laPosteFrench/${documentId}`,
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