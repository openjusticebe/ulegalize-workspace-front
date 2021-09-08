import axios from 'axios';
import FraisAdminDTO from '../model/fraisadmin/FraisAdminDTO';

export async function countFraisByDossierId( accessToken, dossierId ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais/count`, {
            params:{dossierId: dossierId},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch(()=>{
            return {data:[]}
        });
    } catch ( e ) {
        return { error: true, data:[] };
    }
}
export async function getFraisByDossierId( accessToken, dossierId, offset, limit ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais`, {
            params:{ offset : offset, limit:limit, dossierId: dossierId},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch(()=>{
            return {data:[]}
        });
    } catch ( e ) {
        return { error: true, data:[] };
    }
}

// get active vc key list
export async function getFraisMatiere( accessToken, idDebourType ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais/matieres/${idDebourType}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

// get active vc key list
export async function getFraisDefault( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais/default`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

// get active vc key list
export async function getFraisById( accessToken, fraisAdminId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais/${fraisAdminId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}
// get active vc key list
export async function createFrais( accessToken, frais ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais`,
            new FraisAdminDTO(frais) ,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } );
    } catch ( e ) {
        return { error: true };
    }
}

// get active vc key list
export async function updateFrais( accessToken, frais ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais`,
            new FraisAdminDTO(frais) ,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function deleteFrais( accessToken, fraisAdminId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/frais/${fraisAdminId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}
