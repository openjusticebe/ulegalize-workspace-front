import React, { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Lock from './components/Lock';
import { verifyUser } from './services/UserServices';
import queryString from 'query-string';
import isNil from 'lodash/isNil';
import { getOptionNotification } from './utils/AlertUtils';
import label from './data/label';

import NotificationAlert from 'react-notification-alert';
import { Alert } from 'reactstrap';

export const Verify = ( props ) => {
    //const {getAccessTokenSilently, logout} = useAuth0();

    const [count, setCount] = useState( 5 );
    const [messageState, setMessage] = useState( null );
    const [toggle, setToggle] = useState();

    const {
        labelProps,
        location,

        history
    } = props;
    const parsed = queryString.parse( location.search );
    const email = !isNil( parsed ) ? parsed.email : '';
    const key = !isNil( parsed ) ? parsed.key : '';
    const languageParam = !isNil( parsed ) ? parsed.language : 'fr';
    // double check
    let labelDefault = !isNil( label[ languageParam ] ) ? label[ languageParam ] : labelProps;

    useEffect( () => {
        (async () => {
            try {
                const result = await verifyUser( email, key );

                if ( result.data ) {
                    setMessage( labelDefault.wizardSignup.verificationTrue );
                } else {
                    setMessage( labelDefault.wizardSignup.verificationFalse );
                }

                setToggle( result.data );
            } catch ( e ) {
                //logout({returnTo: window.location.origin});
            }
        })();
    }, [] );

    useEffect( () => {
        if ( count === 5 && isNil( messageState ) ) {
            return;
        }
        if ( count => 0 && !isNil( messageState ) ) {

            const interval = setInterval( () => {
                setCount( count => count - 1 );
                if ( count === 0 ) {
                    redirection();
                }
            }, 1000 );
            return () => clearInterval( interval );
        }

    }, [count, messageState] );

    const redirection = () => {
        history.push( '/admin/dashboard' );
    };
    return (
        <>
            <div className="content">

                {!isNil( messageState ) ?
                    (
                        <Alert className="text-center" color={toggle ? 'primary' : 'danger'}>
                            {messageState}
                        </Alert>
                    ) : null}
                <Lock message={`${labelDefault.wizardSignup.redirect} ${count}`}/>
            </div>
        </>
    );
};

export default Verify;