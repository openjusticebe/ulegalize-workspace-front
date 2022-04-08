import React, { useEffect, useRef, useState } from 'react';
import ModalMail from './ModalMail';
import ModalMailFrench from './french/ModalMailFrench';
import { checkPaymentActivated } from '../../../services/PaymentServices';
import { useAuth0 } from '@auth0/auth0-react';
import ModalNoActivePayment from '../popup/ModalNoActivePayment';

import isNil from 'lodash/isNil';
import { getVirtualcabById } from '../../../services/generalInfo/LawfirmService';
import LawfirmDTO from '../../../model/admin/generalInfo/LawfirmDTO';

export default function ModalDetectMail( {
                                             countryCode,
                                             vckeySelected,
                                             documentId,
                                             openPostMail,
                                             showMessage,
                                             updateList,
                                             dossierId,
                                             label
                                         } ) {

    const { getAccessTokenSilently } = useAuth0();
    const [modalPostMailDisplay, setModalPostMailDisplay] = useState( false );
    const [modalPostMailFrenchDisplay, setModalPostMailFrenchDisplay] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const payment = useRef( false );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultPayment = await checkPaymentActivated( accessToken );
            if ( !isNil( resultPayment ) ) {
                payment.current = resultPayment.data;
                if ( payment.current === true ) {
                    let country = 'BE';
                    // if it's create
                    if ( isNil( countryCode ) ) {
                        let virtualCabtResult = await getVirtualcabById( accessToken );

                        if ( !virtualCabtResult.error ) {
                            const lawfirm = new LawfirmDTO( virtualCabtResult.data, label );
                            country = lawfirm.countryCode;
                        }
                    } else {
                        country = countryCode;
                    }

                    _open( country );
                } else {
                    setModalNotPaidSignDocument( !modalNotPaidSignDocument );
                }
            }

        })();
    }, [getAccessTokenSilently, countryCode] );

    const _open = async ( countryCode ) => {
        if ( countryCode === 'FR' ) {
            setModalPostMailFrenchDisplay( !modalPostMailFrenchDisplay );
        } else {
            setModalPostMailDisplay( !modalPostMailDisplay );
        }
    };
    const _toggleMail = async ( countryCode ) => {
        _open( countryCode );

        openPostMail();
    };

    const _toggleUnPaid = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };

    return (
        <>
            {/* POPUP CREATE MAIL BPOST */}
            {modalPostMailDisplay ? (
                <ModalMail
                    vckeySelected={vckeySelected}
                    dossierId={dossierId}
                    label={label}
                    documentId={documentId}
                    modalPostMailDisplay={modalPostMailDisplay}
                    openPostMail={_toggleMail}
                    showMessage={showMessage}
                    updateList={updateList}
                />
            ) : null}
            {modalPostMailFrenchDisplay ? (
                <ModalMailFrench
                    vckeySelected={vckeySelected}
                    dossierId={dossierId}
                    label={label}
                    documentId={documentId}
                    modalPostMailDisplay={modalPostMailFrenchDisplay}
                    openPostMail={_toggleMail}
                    showMessage={showMessage}
                    updateList={updateList}
                />
            ) : null}

            {/* POPUP PAYMENT NOT REGISTERED */}
            {modalNotPaidSignDocument ? (
                <ModalNoActivePayment
                    label={label}
                    toggleModalDetails={_toggleUnPaid}
                    modalDisplay={modalNotPaidSignDocument}/>
            ) : null}
        </>
    );
}