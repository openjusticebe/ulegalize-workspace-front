import React, { useState } from 'react';
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useAuth0 } from '@auth0/auth0-react';
import { createSetupIntent } from '../../services/PaymentServices';
import PaymentAddress from './PaymentAddress';

const PaymentMethodBancontact = ( {
                                      label, email, vckeySelected, amount,
                                      handleUpdateLawfirmAddress,
                                      isPaymentLoading, paymentLoading,
                                      showMessage, checkResult
                                  } ) => {
    const stripe = useStripe();
    const elements = useElements();
    const { getAccessTokenSilently } = useAuth0();
    const [popupLawfirmEmail, setPopupLawfirmEmail] = useState( false );

    const handleConfirmSubmit = async ( event ) => {
        isPaymentLoading( false );
        _togglePopupLawfirmEmail();
    };

    const _togglePopupLawfirmEmail = () => {
        setPopupLawfirmEmail( !popupLawfirmEmail );
    };
    const handleSubmit = async ( lawfirm ) => {

        if ( !stripe || !elements ) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        isPaymentLoading( true );

        const accessToken = await getAccessTokenSilently();

        const resultPayment = await createSetupIntent( accessToken, lawfirm );
        if ( resultPayment.error ) {
            showMessage( label.payment.error1, 'danger' );
            isPaymentLoading( false );

            return;
        }

        const { error } = await stripe.confirmBancontactSetup( resultPayment.data, {
            payment_method: {
                billing_details: {
                    name: vckeySelected,
                    email: email,
                },
            },
            return_url: process.env.REACT_APP_MAIN_URL + 'admin/payment?successstripe=success',
        } );

        if ( error ) {
            showMessage( error + '. ' + label.payment.error2, 'danger' );
        } else {
            showMessage( label.payment.success1, 'primary' );
        }
        isPaymentLoading( false, true );

    };
    return (
        <>
            <Row>
                <Col md={12} className="stripe-pay">
                    <h3 style={{ display: 'grid' }} className="text-align-center">{amount}€ *
                        <small className="text-muted">(*) Bancontact impose un prélèvement minimal de 1 eur</small>
                    </h3>
                </Col>
            </Row>
            <Row>
                <Col md="12" className="padding-top-25 padding-bottom-25">
                    <Button color="primary" type="button"
                            disabled={checkResult === true || paymentLoading === true}
                            onClick={handleConfirmSubmit}
                    >
                        {paymentLoading ? (
                            <Spinner
                                size="sm"
                                color="secondary"
                            />
                        ) : null}
                        {' '} {label.payment.registerCard}
                    </Button>
                </Col>
            </Row>
            {popupLawfirmEmail ? (
                <Modal size="md" isOpen={popupLawfirmEmail} toggle={_togglePopupLawfirmEmail}>
                    <ModalHeader toggle={_togglePopupLawfirmEmail}>
                        <h4>{label.payment.label9}</h4>
                    </ModalHeader>
                    <ModalBody>
                        <PaymentAddress
                            isPopup={true}
                            togglePopupLawfirmEmail={_togglePopupLawfirmEmail}
                            paymentLoading={paymentLoading}
                            vckeySelected={vckeySelected}
                            checkResult={checkResult}
                            label={label}
                            showMessage={showMessage}
                            handleUpdateLawfirmAddress={async ( lawfirm ) => {
                                const result = await handleUpdateLawfirmAddress( lawfirm );
                                if ( result ) {
                                    await handleSubmit( lawfirm );
                                    _togglePopupLawfirmEmail();
                                }
                            }}
                        />
                    </ModalBody>
                </Modal>
            ) : null}
        </>
    );
};

export default PaymentMethodBancontact;
