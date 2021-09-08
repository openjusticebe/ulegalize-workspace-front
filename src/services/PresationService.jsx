import axios from 'axios';
import PrestationSummary from '../model/prestation/PrestationSummary';

export async function getPrestationList( accessToken, offset, limit, vckeySelected ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations`, {
            params: { offset: offset, limit: limit ,
                vcKey: vckeySelected,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}
export async function countPrestationByDossierId( accessToken, vckeySelected, dossierId ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations/count`, {
            params:{
                vcKey: vckeySelected,
                dossierId: dossierId},
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
export async function getPrestationByDossierId( accessToken, vckeySelected, dossierId, offset, limit ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations`, {
            params:{ offset : offset, limit:limit,
                vcKey: vckeySelected,
                dossierId: dossierId},
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
export async function getPrestationDefault( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations/default`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

// get active vc key list
export async function getPrestationById( accessToken, prestationId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations/${prestationId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

// get active vc key list
export async function createPrestation( accessToken, prestation ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations`,
            new PrestationSummary( prestation ),
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

export async function updatePrestation( accessToken, prestation ) {
    try {
        return await axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations`,
            new PrestationSummary( prestation ),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function deletePrestation( accessToken, prestationId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/prestations/${prestationId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function generateReportPrestation( accessToken, start, end ) {
    try {
        return axios.get( `${process.env.REACT_APP_REPORT_SERVER}prestation`, {
            params:{ startDate : start, endDate: end},
            headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error:true}
        });
    } catch ( e ) {
        return { error: true, data: {}};
    }
}