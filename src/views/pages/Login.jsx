import React from 'react';
// reactstrap components
import { useAuth0 } from '@auth0/auth0-react';
import Lock from '../../components/Lock';
const queryString = require('query-string');

export default function Login(props) {
    const { loginWithRedirect } = useAuth0();
    const parsed = queryString.parse(props.location.search);
    let options = {ui_locales:`fr-FR`}
    if(parsed && parsed.screen_hint === 'signup') {
        options['screen_hint'] = 'signup'
    } else {
        options['screen_hint'] = 'login'

    }
    loginWithRedirect(options);

    return (
        <>
            <div className="content ">
                <Lock message="Loading Session"/>
            </div>
        </>
    );
}

