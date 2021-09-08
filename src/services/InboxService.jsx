import axios from 'axios';

export async function uploadFileInbox( accessToken, data ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/inbox`,
            data ,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch(()=>{
            return {data:'ok'}
        });
    } catch ( e ) {
        return { error: true };
    }
}
export async function getDossierListPopup( accessToken, userId, path ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/inbox`, {
            params:{path: path, userId: userId},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch(()=>{
            return {data:[
                ]}
        });
    } catch ( e ) {
        return { error: true, data:[] };
    }
}
export async function getDispatchingFilesByUserId( accessToken, userId ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/inbox/dispatching`, {
            params:{userId: userId},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch(()=>{
            return {data:[
                ]}
        });
    } catch ( e ) {
        return { error: true, data:[
        ] };
    }
}
export async function deletingFile( accessToken, userId , filename) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/inbox`, {
            params:{ filename: filename},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch(()=>{
            return {data:'ok'}
        });
    } catch ( e ) {
        return { error: true, data:[] };
    }
}
export async function moveFile( accessToken, userId , filename, path ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/inbox/move`,
            null ,
        {
            params: { userId: userId, filename: filename, pathTo: path },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
         )
        .catch(()=>{
            return {data:'nok'}
        });
    } catch ( e ) {
        return { error: true, data:[] };
    }
}
export async function downloadFile( accessToken, userId , filename ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/inbox/file`, {
            params: { userId: userId, filename: filename },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
         )
        .catch(()=>{
            return {data:'nok'}
        });
    } catch ( e ) {
        return { error: true, data: {}};
    }
}