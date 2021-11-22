import axios from 'axios';
import LawfirmDTO from '../model/admin/generalInfo/LawfirmDTO';

/**
 * get payment intent secret
 * @param accessToken
 * @param lawfirmDTO
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function createPaymentIntent( accessToken, lawfirmDTO ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/stripe/paymentIntent`,
            lawfirmDTO,
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
export async function createSetupIntent( accessToken, lawfirmDTO ) {
    try {
        return await axios.post( `${process.env.REACT_APP_PAYMENT_SERVER}v1/stripe/setupIntent`,
            lawfirmDTO,
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

export async function checkPaymentActivated( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { data: false,error: true };
    }

}
export async function getLastPaymentError( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/last/error`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { data: false,error: true };
    }

}

export async function getDefaultPaymentMethodId( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/method/default`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: false, error: true };
        } );
    } catch ( e ) {
        return { data: false,error: true };
    }

}

export async function getPaymentTransactions( accessToken, limit, offset ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/transactions`,
            {
                params: {
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
export async function getInvoiceUrl( accessToken, invoiceId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/stripe/invoice/${invoiceId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: null, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function getLastCard( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/card`,
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
export async function deactivatePayment( accessToken ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment`,
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
export async function countTransaction( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/transactions/ongoing`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { data: 1, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}

/**
 * set payment intent to 0euro and aaccept again payment module
 * @param accessToken
 * @returns {Promise<{error: boolean}|AxiosResponse<any>|{data: boolean, error: boolean}>}
 */
export async function paymentIntentExecuted( accessToken ) {
    try {
        return await axios.put( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/intent`,
            {},
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
export async function getPaymentIntentAmount( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/payment/intent`,
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

export async function updateInvoiceAddress(accessToken, virtualcab) {
    try {
        return axios.put(`${process.env.REACT_APP_PAYMENT_SERVER}v1/stripe/address`,
            new LawfirmDTO(virtualcab),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            }).catch((e) => {
            return {error:true, data: e.response.status}
        });
    } catch (e) {
        return {error: true}
    }
}
