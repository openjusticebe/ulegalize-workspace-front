import axios from 'axios';
import { getDossierList, getSharedDossierList } from './DossierService';
import { getEMailRegisteredList } from './EmailRegisteredService';
import { getDocumentsMail } from './PostBirdServices';
import { getUsignByVcKey } from './transparency/UsignService';
import { getChannelList } from './transparency/CaseService';

// get active vc key list
export async function getAllRecent( accessToken, vckeySelected, callback, callbackShared, callbackEmail, callbackMail, callbackUsign, callbackCorresp ) {

    return await axios.all( [
        getDossierList( accessToken, 0, 5 , vckeySelected),
        getSharedDossierList( accessToken, 0, 5, vckeySelected ),
        getEMailRegisteredList( accessToken, 0, 5, null ),
        getDocumentsMail( accessToken, 0, 5, null ),
        getUsignByVcKey( accessToken, 0, 5 ),
        getChannelList( accessToken, 0, 5 ),

] )
    .then(
        axios.spread( ( affaires, sharedAffaires, enmailRegistered, mailRegistered, usign, corresp ) => {
            callback( affaires.data.content );
            callbackShared( sharedAffaires.data.content );
            callbackEmail( enmailRegistered.data.content );
            callbackMail( mailRegistered.data.content );
            callbackUsign( usign.data.content );
            callbackCorresp( corresp.data.content );
        } ) )
    .catch( exception => {

    } );
}
