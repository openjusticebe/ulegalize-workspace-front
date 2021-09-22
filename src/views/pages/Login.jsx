import React from 'react';
// reactstrap components
import { useAuth0 } from '@auth0/auth0-react';
import Lock from '../../components/Lock';

export default function Login() {
    const { loginWithRedirect } = useAuth0();
    loginWithRedirect({ui_locales:`fr-FR`, screen_hint:'signup'});

    return (
        <>
            <div className="content ">
                <Lock message="Loading Session"/>
            </div>
        </>
    );
}

