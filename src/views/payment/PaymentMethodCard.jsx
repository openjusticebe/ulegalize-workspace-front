import React, { useMemo } from 'react';
import { Button, Col, FormGroup, Label, Row, Spinner } from 'reactstrap';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useAuth0 } from '@auth0/auth0-react';
import { createSetupIntent, deactivatePayment } from '../../services/PaymentServices';
import useResponsiveFontSize from './useResponsiveFontSize';
import { updateVirtualcab } from '../../services/generalInfo/LawfirmService';

const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );

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
                                label, vckeySelected, lawfirm, email,amount,
                                openPopupLawfirmEmail,
                                isPaymentLoading, paymentLoading,
                                showMessage, checkResult
                            } ) => {
    const stripe = useStripe();
    const elements = useElements();
    const { getAccessTokenSilently } = useAuth0();
    const options = useOptions();

    const handleSubmit = async ( event ) => {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if ( !stripe || !elements ) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }
        isPaymentLoading( true );

        const accessToken = await getAccessTokenSilently();
        if ( isNil(lawfirm.email) || isEmpty(lawfirm.email) ) {
            showMessage( label.payment.error5, 'danger' );
            isPaymentLoading(false)
            openPopupLawfirmEmail();

            return;
        }

        // update lawfirm in order to receive within payment module
        updateVirtualcab( accessToken, lawfirm );

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

            showMessage( result.error.message  + label.payment.error2, 'danger' );
        } else {
            showMessage( label.payment.success1, 'primary' );
        }
        isPaymentLoading( false );
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
                            onClick={handleSubmit}
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
        </>
    );
};

export default PaymentMethodCard;
