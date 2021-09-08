import axios from 'axios';
import LawfirmConfigDTO from '../../model/admin/generalInfo/LawfirmConfigDTO';

export async function getVirtualcabCaseFolders(accessToken, key) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirmConfig`, {
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

export async function addVirtualcabConfig(accessToken, virtualcabConfig) {
    try {
        return await axios.put(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirmConfig`,
            new LawfirmConfigDTO(virtualcabConfig),
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

export async function removeVirtualcabConfig(accessToken, virtualcabConfigDescription) {
    try {
        console.log("(DEL) Preparing to send to backend: ")
        console.log(virtualcabConfigDescription)
        return await axios.delete(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirmConfigDelete/${virtualcabConfigDescription}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } );
    } catch ( e ) {
        return { error: true };
    }
}
