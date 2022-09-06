import axios from 'axios';
import DossierDTO from '../model/affaire/DossierDTO';
import ShareAffaireDTO from '../model/affaire/ShareAffaireDTO';

export async function getDossierList( accessToken, offset, limit, vckeySelected, searchCriteriaClient, searchCriteriaYear, searchCriteriaNumber, searchCriteriaBalance , searchCriteriaInitiale, searchArchived, sortOpenDate) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/list`, {
            params:{ offset : offset, limit:limit, searchCriteriaClient : searchCriteriaClient,
                vcKey: vckeySelected,
                searchCriteriaYear: searchCriteriaYear,
                searchCriteriaNumber: searchCriteriaNumber,
                searchCriteriaBalance: searchCriteriaBalance,
                searchCriteriaInitiale: searchCriteriaInitiale,
                searchArchived: searchArchived,
                sortOpenDate: sortOpenDate,
            },
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

export async function getSharedDossierList( accessToken, offset, limit,vckeySelected, searchCriteriaClient, searchCriteriaYear, searchCriteriaNumber ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/shared/list`, {
            params:{
                offset : offset,
                limit:limit,
                searchCriteriaClient : searchCriteriaClient,
                searchCriteriaYear: searchCriteriaYear,
                searchCriteriaNumber: searchCriteriaNumber,
                vcKey: vckeySelected,
                // only not closed
                searchArchived: "0"
            },
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

/*
* SEARCH FOR LIST OF AFFAIRE
 */
export async function countByClientId( accessToken , clientId) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/clients/count/${clientId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: -1}
        });
    } catch ( e ) {
        return { error: true };
    }
}


export async function getAffairesByVcUserIdAndSearchCriteria(accessToken, searchCriteria) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires`, {
            params: {searchCriteria: searchCriteria},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: []}
        });
    } catch (e) {
        return {error: true};
    }
}

export async function getDossierById( accessToken, dossierId, vckeySelected ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/${dossierId}`, {
            params:{
                vcKey: vckeySelected,
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

export async function getFinanceDossierById( accessToken, dossierId, vckeySelected ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/finance/${dossierId}`, {
            params:{
                vcKey: vckeySelected,
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

// get active vc key list
export async function getDossierDefault( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/default`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}
// get active vc key list
export async function getSharedUserByAffaireId( accessToken, affaireId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/share/${affaireId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}
// get active vc key list
export async function deleteShareUser( accessToken, data ) {
    try {
        return await axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/users/share`,
            new ShareAffaireDTO(data) ,
            {
                headers: {
                Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
        } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function createDossier( accessToken, dossier ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires`,
            new DossierDTO(dossier) ,
            {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function createDossierAndAttach( accessToken, caseId, dossier ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/attach/${caseId}`,
            new DossierDTO(dossier) ,
            {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function addShareUser( accessToken, data, isSendMail ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/users/share`,
            new ShareAffaireDTO(data) ,
            {
                params:{isSendMail : isSendMail},
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function switchDossierDigital( accessToken, dossierId ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/digital`,
            dossierId ,
            {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        } ).catch(()=>{
            return { error: true }
        });
    } catch ( e ) {
        return { error: true };
    }
}

export async function updateDossier( accessToken, dossier ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires`,
                 dossier  ,
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
export async function generateReportEtat( accessToken, affaireId ) {
    try {
        return axios.get( `${process.env.REACT_APP_REPORT_SERVER}etatHonoraire/${affaireId}`, {
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

export async function generateReportDossier( accessToken, vckeySelected, searchCriteriaNumber, searchCriteriaYear, searchCriteriaClient, searchCriteriaInitiale, searchCriteriaBalance, searchArchived ) {
    try {
        return axios.get( `${process.env.REACT_APP_REPORT_SERVER}dossier`, {
                params:{
                    searchCriteriaClient : searchCriteriaClient,
                    vcKey: vckeySelected,
                    searchCriteriaYear: searchCriteriaYear,
                    searchCriteriaNumber: searchCriteriaNumber,
                    searchCriteriaBalance: searchCriteriaBalance,
                    searchCriteriaInitiale: searchCriteriaInitiale,
                    searchArchived: searchArchived,
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