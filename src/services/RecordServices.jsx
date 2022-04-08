import axios from 'axios';

/**
 * get payment intent secret
 * @param accessToken
 * @param lawfirmDTO
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function getRecognitionToken( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/record/token`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            } ).catch( () => {
            return { data: '', error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}
