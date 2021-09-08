import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Lock from './components/Lock';
import { updateToken } from './services/LawfirmsService';
import LawfirmDriveDTO from './model/admin/generalInfo/LawfirmDriveDTO';
const queryString = require('query-string');

const isNil = require( 'lodash/isNil' );

export const Dropbox = ( props ) => {
    const { getAccessTokenSilently, logout } = useAuth0();

    const {
        location,

        history
    } = props;
    const parsed = queryString.parse(location.search);
    const dropbox_token = !isNil(parsed) ? parsed.dropbox_token : '';

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();

                const lawfirmDriveDTO = new LawfirmDriveDTO();
                lawfirmDriveDTO.driveType = 'dropbox';
                lawfirmDriveDTO.dropboxToken = dropbox_token;
                const result = await updateToken(accessToken, lawfirmDriveDTO);
                if(result.error) {
                    history.push( '/admin/dashboard' );
                } else {
                    history.push( '/admin/security' );
                }

            } catch ( e ) {
                logout( { returnTo: window.location.origin } );

            }
        })();
    }, [getAccessTokenSilently] );

    return (
        <Lock message="Waiting Answer Dropbox"/>
    );
};

export default Dropbox;