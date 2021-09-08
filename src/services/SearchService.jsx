import axios from 'axios';

export async function getUserResponsableList( accessToken , vckeySelected, vcKeyToSearch) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/users`, {
            params:{
                vcKey: vckeySelected,
                vcKeyToSearch : vcKeyToSearch
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
export async function getFullUserList( accessToken , search ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/users/full`, {
            params:{ search : search},
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

export async function getMatieres( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/matieres`, {
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
export async function getDossierType( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/dossierType`, {
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
export async function getLanguageList( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/languages`, {
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
export async function getCountryList( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/countries`, {
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
export async function getAlpha2CountryList( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/alpha2countries`, {
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
export async function getTiers( accessToken , honoraires, tiers, debours, fraisCollaborative) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/tiers`, {
            params:{
                honoraires:honoraires,
                tiers:tiers,
                debours:debours,
                fraisCollaborative:fraisCollaborative,
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
export async function getComptaTypes( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/types`, {
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
export async function getPostes( accessToken, debours, frais, honoraires ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/postes`, {
            params:{
                frais:frais,
                debours:debours,
                honoraires:honoraires
            },
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

export async function getFacturesTypes( accessToken, isCreated ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/facturesTypes`, {
            params:{
                isCreated:isCreated
            },
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

export async function getFactureEcheances( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/factureEcheances`, {
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

export async function getTimesheetTypes( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/timesheetTypes`, {
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
export async function getDeboursType( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/deboursTypes`, {
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
export async function getVats( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/vats`, {
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
export async function getDefaultVats( accessToken, countryCode ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/vats/country/${countryCode}`, {
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
export async function getMesureType( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/mesureType`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getCalendarEventType( accessToken, onlyDossier ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/calendarEventType`, {
            params:{
                onlyDossier:onlyDossier
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getAccountType( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/accountType`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getFunctions( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/roles`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getCurrencies( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/currencies`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getContextModel( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/contextModel`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getTemplateModel( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/search/templateModel`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch(()=>{
            return {error: true, data: []}
        });
    } catch ( e ) {
        return { error: true };
    }
}