import React from 'react';
import { Button, Col, Row, Spinner } from 'reactstrap';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useAuth0 } from '@auth0/auth0-react';
import { createSetupIntent } from '../../services/PaymentServices';
import { updateVirtualcab } from '../../services/generalInfo/LawfirmService';

const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );

const PaymentMethodBancontact = ( {
                                      label, email, vckeySelected, amount,
                                      openPopupLawfirmEmail,
                                      isPaymentLoading, paymentLoading,
                                      lawfirm, showMessage, checkResult
                                  } ) => {
    const stripe = useStripe();
    const elements = useElements();
    const { getAccessTokenSilently } = useAuth0();

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

        if ( isNil( lawfirm.email ) || isEmpty( lawfirm.email ) ) {
            showMessage( label.payment.error5, 'danger' );
            isPaymentLoading( false );
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
        isPaymentLoading( false );

    };
    return (
        <>
            <Row>
                <Col md={12} className="stripe-pay">
                    <h3 style={{display:'grid'}} className="text-align-center">{amount}€ *
                        <small className="text-muted">(*) Bancontact impose un prélèvement minimal de 1 eur</small>
                        </h3>
                </Col>
            </Row>
            <Row>
                <Col md="12" className="padding-top-25 padding-bottom-25">
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

export default PaymentMethodBancontact;
