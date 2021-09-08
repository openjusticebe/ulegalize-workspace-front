import axios from 'axios';

/**
 * get user LawyerDTO
 * @param accessToken
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function getLawyer( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawyer`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function updateProfile( accessToken, profile ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawyer`,
            profile  ,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}


export async function uploadProfileImage( accessToken, data ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawyer/logo`,
            data ,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch(()=>{
            return { error: true };
        });
    } catch ( e ) {
        return { error: true };
    }
}