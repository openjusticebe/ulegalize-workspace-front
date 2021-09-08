import React, { useRef } from 'react';
// reactstrap components
import {
    Card,
    CardBody,
    Col,
    Row,
} from 'reactstrap';
import 'moment/locale/fr';
import NotificationAlert from 'react-notification-alert';
import CasesList from './CasesList';

export default function CorrespondenceList( { label, email, userId, vckeySelected, enumRights, history } ) {
    const notificationAlert = useRef( null );

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col lg="12" sm={12}>
                        <Card>
                            <CardBody>
                               <CasesList
                                   label={label}
                                   email={email}
                                   userId={userId}
                                   vckeySelected={vckeySelected}
                                   enumRights={enumRights}
                                   history={history}
                               />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}
