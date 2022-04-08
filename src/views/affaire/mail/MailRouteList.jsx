import React, { useRef } from 'react';
import NotificationAlert from 'react-notification-alert';
import MailList from './MailList';

export default function MailRouteList( {
                                           label, vckeySelected
                                       } ) {

    const notificationAlert = useRef( null );

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>

                <MailList
                    dossierId={null}
                    vckeySelected={vckeySelected}
                    label={label}/>
            </div>
        </>
    );
}

