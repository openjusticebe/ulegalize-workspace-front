import axios from 'axios';

export async function getInvoiceAddress(accessToken) {
    try {
        return axios.get(`${process.env.REACT_APP_PAYMENT_SERVER}v1/lawfirm`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            }).catch(() => {
            return {error:true}
        });
    } catch (e) {
        return {error: true}
    }
}
