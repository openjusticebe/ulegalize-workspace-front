import axios from 'axios';

export async function getActiveVckey( accessToken, vckey, offset, limit ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}public/lawfirms?search=all`, {
            params: { vckey: vckey },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}
