import React, { useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { deleteDocumentById, } from '../../../services/PostBirdServices';
import { getOptionNotification } from '../../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import MailList from './MailList';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import ModalMail from './ModalMail';
import ModalNoActivePayment from '../popup/ModalNoActivePayment';
import { checkPaymentActivated } from '../../../services/PaymentServices';

const isNil = require( 'lodash/isNil' );

export default function MailRouteList( {
                                           label, vckeySelected
                                       } ) {

    const { getAccessTokenSilently } = useAuth0();
    const notificationAlert = useRef( null );
    const documentIdRef = useRef( true );
    const payment = useRef( false );

    const [deleteAlert, setDeleteAlert] = useState( null );
    const [modalPostMailDisplay, setModalPostMailDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const [updateList, setUpdateList] = useState( false );

    const _openPostMail = async ( documentId ) => {
        documentIdRef.current = documentId;
        const accessToken = await getAccessTokenSilently();

        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) ) {
            payment.current = resultPayment.data;
            if ( payment.current === true ) {
                setModalPostMailDisplay( !modalPostMailDisplay );
            } else {
                setModalNotPaidSignDocument( !modalNotPaidSignDocument );
            }
        }
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
    const showMessage = async ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };

    const _updateList = () => {
        setUpdateList( !updateList );
    };

    const _toggleUnPaid = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                {deleteAlert}

                <MailList
                    dossierId={null}
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
            </div>
            {modalPostMailDisplay ? (
                <ModalMail
                    vckeySelected={vckeySelected}
                    dossierId={null}
                    label={label}
                    documentId={documentIdRef.current}
                    modalPostMailDisplay={modalPostMailDisplay}
                    openPostMail={_openPostMail}
                    showMessage={showMessage}
                    updateList={_updateList}
                />
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

