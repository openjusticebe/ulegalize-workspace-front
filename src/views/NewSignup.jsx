import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import Wizard from './forms/Wizard';
import { getUsers } from '../services/UserServices';
import ProfileDTO from '../model/user/ProfileDTO';

const isNil = require( 'lodash/isNil' );

export const NewSignup = ( props ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [profile, setProfile] = useState();

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                const result = await getUsers( accessToken );

                if ( !isNil( result ) ) {
                    if ( !isNil( result.data ) ) {
                        const profileDto = new ProfileDTO( result.data );

                        setProfile( profileDto );
                    } else if ( result.error ) {
                        // error message
                    }
                } else {
                    props.history.push( '/' );
                }

            } catch ( e ) {
                //logout( { returnTo: process.env.REACT_APP_MAIN_URL } );

            }
        })();
    }, [getAccessTokenSilently] );

    return (
        <Wizard
            history={props.history}
            user={profile} label={props.label}/>
    );
};

export default NewSignup;