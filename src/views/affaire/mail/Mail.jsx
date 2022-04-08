import React from 'react';
import { Card, CardBody, Col, Row, } from 'reactstrap';
import MailList from './MailList';
import EmailsList from '../../list/EmailsList';

const MAX_HEIGHT_CARD = 700;

export default function Mail( {
                                  dossierId,
                                  label,
                                  showMessage,
                                  userId,
                                  email,
                                  vckeySelected
                              } ) {
    return (
        <>
            <Row>
                <Col md={6} sm={12}>
                    <Card style={{ minHeight: MAX_HEIGHT_CARD }}>
                        <CardBody>
                            <MailList
                                vckeySelected={vckeySelected}
                                dossierId={dossierId}
                                label={label}/>
                        </CardBody>
                    </Card>

                </Col>
                <Col md={6} sm={12}>
                    <Card style={{ minHeight: MAX_HEIGHT_CARD }}>
                        <CardBody>
                            <EmailsList
                                email={email}
                                userId={userId}
                                vckeySelected={vckeySelected}
                                showMessage={showMessage}
                                dossierId={dossierId}
                                showDossier={false}
                                label={label}/>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

