import React, { useMemo, useState } from 'react';
import { Button, Col, FormGroup, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useAuth0 } from '@auth0/auth0-react';
import { createSetupIntent, deactivatePayment } from '../../services/PaymentServices';
import useResponsiveFontSize from './useResponsiveFontSize';
import PaymentAddress from './PaymentAddress';

const useOptions = () => {
    const fontSize = useResponsiveFontSize();
    const options = useMemo(
        () => ({
            hidePostalCode: true,
            style: {
                base: {
                    fontSize,
                    color: '#424770',
                    letterSpacing: '0.025em',
                    fontFamily: 'Source Code Pro, monospace',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#9e2146'
                }
            }
        }),
        [fontSize]
    );

    return options;
};

const PaymentMethodCard = ( {
                                label, vckeySelected, email, amount,
                                openPopupLawfirmEmail, handleUpdateLawfirmAddress,
                                isPaymentLoading, paymentLoading,
                                showMessage, checkResult
                            } ) => {
    const stripe = useStripe();
    const elements = useElements();
    const { getAccessTokenSilently } = useAuth0();
    const [popupLawfirmEmail, setPopupLawfirmEmail] = useState( false );
    const options = useOptions();

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

        const result = await stripe.confirmCardSetup( resultPayment.data, {
            payment_method: {
                card: elements.getElement( CardElement ),
                billing_details: {
                    name: vckeySelected,
                    email: email,
                },
            },
            return_url: process.env.REACT_APP_MAIN_URL + 'admin/payment?successstripe=success',

        } );

        if ( result.error ) {
            deactivatePayment( accessToken );

            showMessage( result.error.message + label.payment.error2, 'danger' );
        } else {
            showMessage( label.payment.success1, 'primary' );
        }
        isPaymentLoading( false, true );
    };
    return (
        <>
            <Row>
                <Col md={12} className="stripe-pay">
                    <h3>{amount}€</h3>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Label>{label.payment.label4}</Label>
                    <FormGroup>
                        <CardElement options={options}/>
                    </FormGroup>
                </Col>

            </Row>
            <Row>
                <Col md="12" className="padding-top-25">
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

export default PaymentMethodCard;
