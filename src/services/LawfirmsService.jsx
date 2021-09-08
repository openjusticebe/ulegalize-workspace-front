import axios from 'axios';
import LawyerDTO from '../model/admin/user/LawyerDTO';
import LawfirmDriveDTO from '../model/admin/generalInfo/LawfirmDriveDTO';

export async function getLawfirmList( accessToken, userId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/users/list`, {
            params:{
                userId: userId,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}
export async function getLawfirmUserByUserId( accessToken , userId) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}
export async function getLawfirmByName( accessToken , name) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm`, {
            params:{
                name:name
            },headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}
export async function searchLawfirmByName( accessToken , name) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/search`, {
            params:{
                name:name
            },headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}
export async function switchLawfirm( accessToken, newVcKeySelected ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/switch`,
            newVcKeySelected,
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
export async function createLawfirm( accessToken, newVckey, countryCode ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm`,
            newVckey,
            {
                params:{
                    countryCode: countryCode
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { data: {}, error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }

}
export async function updateRoleLawfirmUser( accessToken, lawyerDTO ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/users/role`,
            new LawyerDTO(lawyerDTO),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: true, data: lawyerDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}
export async function updateToken( accessToken, lawfirmDriveDto ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/updateToken`,
            new LawfirmDriveDTO(lawfirmDriveDto),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: true, data: lawfirmDriveDto };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}