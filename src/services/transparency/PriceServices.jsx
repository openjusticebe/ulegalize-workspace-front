import axios from 'axios';

export async function fetchUsignPaymentPrice( accessToken, callback ) {
    try {

        return await axios.all( [
            getUsignPaymentPrice(accessToken)
        ] )
        .then(
            axios.spread( ( priceResult ) => {
                callback( !priceResult.error ? priceResult.data : -100 );
            } ) )
        .catch( exception => {
            return { data: 0, error:true };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}
export async function fetchEmailPaymentPrice( accessToken, callback ) {
    try {

        return await axios.all( [
            getEmailPaymentPrice(accessToken)
        ] )
        .then(
            axios.spread( ( priceResult ) => {
                callback( !priceResult.error ? priceResult.data : -100 );
            } ) )
        .catch( exception => {
            return { data: 0, error:true };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}
export async function getUsignPaymentPrice( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/price/usign`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } )
        .catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function getEmailPaymentPrice( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/price/email`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } )
        .catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function getRecordingPrice( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/price/record`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } )
        .catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function getRecordingSpeechPrice( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/price/speechToText`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } )
        .catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}

