import axios from 'axios';
import LawfirmDTO from '../../model/admin/generalInfo/LawfirmDTO';

export async function getVirtualcabById(accessToken, key) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirm`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {error:true}
        });
    } catch (e) {
        return {error: true};
    }
}

export async function createVirtualcab(accessToken, virtualcab) {
    try {
        return axios.post(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirm`,
        virtualcab,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
    } catch (e) {
        return {error: true};
    }
}

export async function updateVirtualcab(accessToken, virtualcab) {
    try {
        return axios.put(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirm`,
            new LawfirmDTO(virtualcab),
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

export async function uploadImageVirtualcab( accessToken, data ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirm/logo`,
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