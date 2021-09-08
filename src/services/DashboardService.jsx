import axios from 'axios';
import { getDossierList, getSharedDossierList } from './DossierService';
import { getEMailRegisteredList } from './EmailRegisteredService';
import { getDocumentsMail } from './PostBirdServices';

// get active vc key list
export async function getAllRecent( accessToken, vckeySelected, callback, callbackShared, callbackEmail, callbackMail ) {

    return await axios.all( [
        getDossierList( accessToken, 0, 5 , vckeySelected),
        getSharedDossierList( accessToken, 0, 5, vckeySelected ),
        getEMailRegisteredList( accessToken, 0, 5, null ),
        getDocumentsMail( accessToken, 0, 5, null )

] )
    .then(
        axios.spread( ( affaires, sharedAffaires, enmailRegistered, mailRegistered ) => {
            callback( affaires.data.content );
            callbackShared( sharedAffaires.data.content );
            callbackEmail( enmailRegistered.data.content );
            callbackMail( mailRegistered.data.content );
        } ) )
    .catch( exception => {

    } );
}
