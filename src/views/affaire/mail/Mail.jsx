import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Row, } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { checkPaymentActivated } from '../../../services/PaymentServices';
import ModalNoActivePayment from '../popup/ModalNoActivePayment';
import MailList from './MailList';
import ModalMail from './ModalMail';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import { deleteDocumentById } from '../../../services/PostBirdServices';
import ModalEMailSign from './recommande/ModalEMailSign';
import MailRegisteredList from './recommande/MailRegisteredList';

const isNil = require( 'lodash/isNil' );

export default function Mail( {
                                  dossierId,
                                  label,
                                  showMessage,
                                  userId,
                                  email,
                                  vckeySelected
                              } ) {
    const [modalPostMailDisplay, setModalPostMailDisplay] = useState( false );
    const [modalEmailDisplay, setModalEmailDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const [updateList, setUpdateList] = useState( false );
    const [updateEmailList, setUpdateEmailList] = useState( false );
    const [deleteAlert, setDeleteAlert] = useState( null );

    const { getAccessTokenSilently } = useAuth0();
    const payment = useRef( false );
    const documentIdRef = useRef( true );
// transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultPayment = await checkPaymentActivated( accessToken );
            if ( !isNil( resultPayment ) ) {
                payment.current = resultPayment.data;
            }
        })();
    }, [getAccessTokenSilently] );

    const _updateList = () => {
        setUpdateList( !updateList );
    };
    const _updateEmailList = () => {
        setUpdateEmailList( !updateEmailList );
    };

    const _openPostMail = ( documentId ) => {
        documentIdRef.current = documentId;

        if ( payment.current === true ) {
            setModalPostMailDisplay( !modalPostMailDisplay );
        } else {
            setModalNotPaidSignDocument( !modalNotPaidSignDocument );
        }
    };

    const _openEmail = () => {
        if ( payment.current === true ) {
            setModalEmailDisplay( !modalEmailDisplay );
        } else {
            setModalNotPaidSignDocument( !modalNotPaidSignDocument );
        }
    };

    const _toggleUnPaid = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };

    const _deletePostMail = async ( documentId ) => {
        documentIdRef.current = documentId;

        const accessToken = await getAccessTokenSilently();

        const result = await deleteDocumentById( accessToken, documentIdRef.current );

        setDeleteAlert( null );
        if ( result.data ) {
            _updateList();

            showMessage( label.common.success2, 'primary' );
        } else {
            showMessage( label.common.error3, 'danger' );
        }

    };

    return (
        <>
            <Card>
                <CardBody>
                    <>
                        <Row>
                            <Col lg={6} md={6} sm={12} xs={12}>
                                <Button size={`lg`}
                                        className="very-big-btn"
                                        onClick={() => _openPostMail()}
                                        block>{label.mail.label1}</Button>
                            </Col>
                            <Col lg={6} md={6} sm={12} xs={12}>
                                <Button size={`lg`}
                                        className="very-big-btn"
                                        onClick={() => _openEmail()}
                                        block>{label.mail.label2}</Button>
                            </Col>
                        </Row>
                    </>
                </CardBody>
            </Card>
            {deleteAlert}

            <Row>
                <Col md={6} sm={12}>
                    <MailList
                        dossierId={dossierId}
                        updateList={updateList}
                        openPostMail={_openPostMail}
                        deletePostMail={( documentId ) => {
                            setDeleteAlert( <ReactBSAlert
                                warning
                                style={{ display: 'block', marginTop: '30px' }}
                                title={label.common.label10}
                                onConfirm={() => {
                                    _deletePostMail( documentId );
                                }}
                                onCancel={() => { setDeleteAlert( null ); }}
                                confirmBtnBsStyle="success"
                                cancelBtnBsStyle="danger"
                                confirmBtnText={label.common.label11}
                                cancelBtnText={label.common.cancel}
                                showCancel
                                btnSize=""
                            >
                                {label.common.label12}
                            </ReactBSAlert> );
                        }}
                        label={label}/>
                </Col>
                <Col md={6} sm={12}>
                    <MailRegisteredList
                        showMessage={showMessage}
                        dossierId={dossierId}
                        updateList={updateEmailList}
                        label={label}/>
                </Col>
            </Row>

            {modalPostMailDisplay ? (
                <ModalMail
                    dossierId={dossierId}
                    label={label}
                    documentId={documentIdRef.current}
                    modalPostMailDisplay={modalPostMailDisplay}
                    openPostMail={_openPostMail}
                    showMessage={showMessage}
                    updateList={_updateList}
                />
            ) : null}
            {modalEmailDisplay ? (
                <ModalEMailSign
                    attachedFile={[]}
                    affaireId={dossierId}
                    label={label}
                    userId={userId}
                    email={email}
                    vckeySelected={vckeySelected}
                    showMessage={showMessage}
                    updateList={_updateEmailList}
                    showMessagePopup={showMessage}
                    toggleModalDetails={_openEmail}
                    modalDisplay={modalEmailDisplay}/>
            ) : null}
            {modalNotPaidSignDocument ? (
                <ModalNoActivePayment
                    label={label}
                    toggleModalDetails={_toggleUnPaid}
                    modalDisplay={modalNotPaidSignDocument}/>
            ) : null}

        </>
    );
}

