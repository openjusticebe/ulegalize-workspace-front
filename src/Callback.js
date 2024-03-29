import React, { useEffect, useState } from 'react';
import { registerUser } from './services/UserServices';
import { useAuth0 } from '@auth0/auth0-react';
import { Container } from 'reactstrap';
import Lock from './components/Lock';
const isNil = require( 'lodash/isNil' );

export const Callback = ( props ) => {
    const { getAccessTokenSilently, user, logout } = useAuth0();
    const [newUser, setNewUser] = useState( );


    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                const subdomain = window.location.host.split( '.' )[ 0 ];
                localStorage.setItem('subdomain', subdomain);

                if(!isNil(user[ process.env.REACT_APP_AUTH_RULES_URL + 'app_metadata' ] )) {
                    const signup = user[ process.env.REACT_APP_AUTH_RULES_URL + 'app_metadata' ].signedup_submitted;
                    setNewUser(signup);

                    if(signup === true) {
                        const result = await registerUser( accessToken );
                        // this is created but with unverified user
                        if ( result.data && result.data === 'UNVERIFIED' ) {
                            props.history.push( '/auth/newsignup' );
                        } else {
                            const accessToken = await getAccessTokenSilently( { ignoreCache: true } );

                            props.history.push( '/admin/dashboard' );
                        }
                    } else {
                        const accessToken = await getAccessTokenSilently( { ignoreCache: true } );

                        props.history.push( '/admin/dashboard' );
                    }
                } else {
                    const accessToken = await getAccessTokenSilently( { ignoreCache: true } );

                    setNewUser(false);

                    props.history.push( '/' );
                }

            } catch ( e ) {
                logout( { returnTo: process.env.REACT_APP_LOGOUT_URL } );

            }
        })();
    }, [getAccessTokenSilently] );

    if ( !isNil(newUser) && newUser === true ) {
        return (
            <div className="content">
                <Container>
                    <Lock message="Creating user..."/>
                </Container>
            </div>
        );
    } else {
        return (
            <Lock message="Waiting authorization"/>
        );
    }
};

export default Callback;