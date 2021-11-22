import axios from 'axios';
import CasDTO from '../../model/affaire/CasDTO';
import ChannelDTO from '../../model/affaire/ChannelDTO';

export async function getCaseList( accessToken, offset, limit ) {
    try {

        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases`, {
            params: { offset: offset, limit: limit },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getChannelList( accessToken, offset, limit ) {
    try {

        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/channels`, {
            params: { offset: offset, limit: limit },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function downloadFileAttached( accessToken, casId, filename ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/drive/cas/file`, {
                params: { casId: casId, filename: filename },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true, data: 'nok' };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
export async function downloadFileChannelAttached( accessToken, channelId, filename ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/drive/cas/channel/file`, {
                params: { channelId: channelId, filename: filename },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true, data: 'nok' };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}

export async function downloadFileAttachedUsign( accessToken, usignId ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/drive/usign/file`, {
                params: { usignId: usignId },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true, data: 'nok' };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}

export async function attachEsignDocument( accessToken, dossierId, files ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/connective/${dossierId}/document`,
                files,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
export async function attachEsignDocumentChannel( accessToken, dossierId, files ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/channel/connective/${dossierId}/document`,
                files,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}

export async function updateChannel(accessToken, channelContent ) {
    try {
        return axios.put( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/channel`,
            channelContent,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
export async function updateCase(accessToken, cas ) {
    try {
        return axios.put( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases`,
            cas,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
export async function saveLawyer(accessToken, cas ) {
    try {

        return axios.put( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/owner`,
            new CasDTO(cas),
            {
            headers: {
                //'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
export async function getCaseById(accessToken, casId ) {
    try {

        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/${casId}`,
            {
            headers: {
                //'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
// attachFileCase
export async function attachFileCase(accessToken, files ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/files`,
            files,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}
// attachFileChannel
export async function attachFileChannel(accessToken, files ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/channel/files`,
            files,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}

export async function createDossierTransparency( accessToken, caseCreation ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases`,
            caseCreation ,
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
export async function getCasByDossierIdAndPartie( accessToken, dossierId, partie ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}`,
            {
                params: { partie: partie },

                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getPartiesByDossierId( accessToken, dossierId ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}/parties`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function createConseilByDossier( accessToken, dossierId , itemPartie) {
    try {
        return axios.put( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}/parties`,
            itemPartie,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function inviteConseil( accessToken, dossierId , itemPartie) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/affaires/parties/${dossierId}/invite`,
            itemPartie,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function updatePartieByDossier( accessToken, dossierId , itemPartie) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}/parties`,
            itemPartie,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getChannelsByDossierId( accessToken, dossierId ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}/channels`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getChannelsByCaseId( accessToken, caseId ) {
    try {
        return axios.get( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/${caseId}/channels`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function createChannel( accessToken, dossierId , channel) {
    try {
        return axios.put( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}/channels`,
            new ChannelDTO(channel),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return {data: null, error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function checkPartiesInvolvedIntoChannel( accessToken, dossierId , channel) {
    try {
        return axios.put( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/cases/dossier/${dossierId}/channels/parties`,
            new ChannelDTO(channel),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            } ).catch(()=>{
            return { error: true}
        });
    } catch ( e ) {
        return { error: true };
    }
}

export async function attachDossier( accessToken, caseCreationDTO, caseId ) {
    try {
        return axios.post( `${process.env.REACT_APP_TRANSPARENCY_SERVER}v2/affaires/case/${caseId}`,
            caseCreationDTO,
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