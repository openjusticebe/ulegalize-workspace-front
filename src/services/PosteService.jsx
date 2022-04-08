import axios from 'axios';

export async function countryAvailable( accessToken) {
    try {
        return await axios.get( `${process.env.REACT_APP_PAYMENT_SERVER}v1/poste`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data:[]}
        });
    } catch ( e ) {
        return { error: true };
    }
}