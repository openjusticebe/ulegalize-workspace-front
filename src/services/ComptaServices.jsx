import axios from 'axios';
import ComptaDTO from '../model/compta/ComptaDTO';
import { getComptaTypes, getPostes, getTiers } from './SearchService';

/**
 * get compta by id
 * @param accessToken
 * @param fraisId
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function getComptaById( accessToken, fraisId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta`, {
            params:{ fraisId : fraisId},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }

}

export async function getGrids( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta/grids`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function getComptaByDossierList( accessToken, offset, limit , searchCriteriaClient, searchCriteriaNumber, searchCriteriaYear, searchCriteriaPoste) {
    try {
        return await getComptaByDossierId(accessToken, null, offset, limit ,null, null, null,null, searchCriteriaClient, searchCriteriaYear, searchCriteriaNumber, searchCriteriaPoste);
    } catch (e) {
        return {error: true, data: []};
    }
}

export async function getComptaByDossierId( accessToken, dossierId, offset, limit , isDebours, isFraiCollaboration, honoraire, tiers, searchCriteriaClient, searchCriteriaYear, searchCriteriaNumber, searchCriteriaPoste) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta/list`, {
            params:{
                offset : offset, limit:limit,
                dossierId: dossierId,
                isDebours: isDebours ,
                isFraiCollaboration:isFraiCollaboration,
                honoraire:honoraire,
                tiers:tiers,
                searchCriteriaClient : searchCriteriaClient,
                searchCriteriaYear: searchCriteriaYear,
                searchCriteriaNumber: searchCriteriaNumber,
                searchCriteriaPoste: searchCriteriaPoste,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .catch(() => {
                return {data: []}
            });
    } catch (e) {
        return {error: true, data: []};
    }
}

export async function updateCompta(accessToken, compta) {
    try {
        return axios.put(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta`,
            compta,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function createCompta(accessToken, compta) {
    try {
        return axios.post(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta`,
            new ComptaDTO(compta),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function getComptaDefault( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta/default`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function getTvaComptaDefault( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta/tva/default`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function deleteCompta( accessToken, comptaId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/compta/${comptaId}`, {
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
// get active vc key list
export async function getAllInfo( accessToken, debours, fraisCollaborative, honoraires, tiers, callback ) {

    return await axios.all( [
        getGrids( accessToken ),
        getTiers( accessToken, honoraires, tiers , debours, fraisCollaborative),
        getPostes( accessToken, debours, fraisCollaborative, honoraires),
        getTvaComptaDefault( accessToken ),
        getComptaTypes( accessToken )
    ] )
    .then(
        axios.spread( ( grids, tiers, postes, tva, types ) => {
            callback(grids.data , tiers.data , postes.data ,  tva.data , types.data);
        } ) )
    .catch( exception => {

    } );
}
export async function generateReportCompta( accessToken, start, end, vckeySelected, searchCriteriaNumber, searchCriteriaYear, searchCriteriaClient, searchCriteriaPoste ) {
    try {
        return axios.get( `${process.env.REACT_APP_REPORT_SERVER}v1/compta`, {
                params:{
                    startDate : start,
                    endDate: end,
                    vcKey: vckeySelected,
                    searchCriteriaClient : searchCriteriaClient,
                    searchCriteriaYear: searchCriteriaYear,
                    searchCriteriaNumber: searchCriteriaNumber,
                    searchCriteriaPoste:  searchCriteriaPoste
                },
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