import axios from 'axios';
import ShareFileDTO from '../model/drive/ShareFileDTO';

export async function uploadFile( accessToken, data ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/file`,
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
export async function getDossierFilesList( accessToken, path ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive`, {
            params:{path: path},
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
export async function deletingFile( accessToken, path) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/file`, {
            params:{path: encodeURIComponent(path)},
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
export async function deletingFolder( accessToken, path) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/folder`, {
            params:{path: encodeURIComponent(path)},
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
export async function renameFile( accessToken, newfilename, pathFrom, pathTo ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/file/rename`,
            null ,
        {
            params: { newfilename: newfilename,
                pathFrom: encodeURIComponent(pathFrom) ,
                pathTo: encodeURIComponent(pathTo) ,
            },
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
export async function renameFolder( accessToken, pathFrom, pathTo ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/folder/rename`,
            null ,
        {
            params: {
                pathFrom: encodeURIComponent(pathFrom) ,
                pathTo: encodeURIComponent(pathTo) ,
            },
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
export async function createFolder( accessToken, fullpath ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/folder`,
            null ,
        {
            params: {
                fullpath: encodeURIComponent(fullpath)
            },
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
export async function downloadFile( accessToken , path ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/file`, {
            params: { path: path },
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

export async function getShareUsers( accessToken, path ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/share`, {
            params:{path: path},
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

export async function shareObject( accessToken, data ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/share`,
            new ShareFileDTO(data) ,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error: true, data: {}}
        });
    } catch ( e ) {
        return { error: true, data:{} };
    }
}
export async function shareLink( accessToken, path ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/share/link`, {
            params:{path: path},
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error: true, data: {}}
        });
    } catch ( e ) {
        return { error: true, data:{} };
    }
}
export async function startDropbox( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_DRIVE_SERVER}v2/dropbox/start`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error: true, data: ''}
        });
    } catch ( e ) {
        return { error: true, data:'' };
    }
}
export async function startOnedrive( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_DRIVE_SERVER}v2/onedrive/start`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error: true, data: ''}
        });
    } catch ( e ) {
        return { error: true, data:'' };
    }
}

export async function checkToken( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_DRIVE_SERVER}v2/dropbox/check`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error: true, data: ''}
        });
    } catch ( e ) {
        return { error: true, data:'' };
    }
}