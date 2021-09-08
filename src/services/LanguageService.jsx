import axios from 'axios';

export async function changeLanguage( accessToken, language ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/user/language`,
            language,
            {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}