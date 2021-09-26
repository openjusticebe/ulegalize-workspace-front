import React, { useEffect, useMemo, useState } from 'react';
import { CardElement, useStripe } from '@stripe/react-stripe-js';

// reactstrap components
import {
    Alert,
    Button,
    Col,
    FormGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
    Spinner,
    TabContent,
    TabPane
} from 'reactstrap';
import stripeLogo from '../../assets/img/Powered by Stripe - blurple.svg';
import { useAuth0 } from '@auth0/auth0-react';
import {
    getDefaultPaymentMethodId,
    getPaymentIntentAmount,
    paymentIntentExecuted
} from '../../services/PaymentServices';
import useResponsiveFontSize from './useResponsiveFontSize';
import { Link } from 'react-router-dom';

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
export default function PaymentMethodToPay( {
                                                paymentErrorModal,
                                                label, closePaymentIntent, vckeySelected,
                                                showMessage,
                                                isPaymentLoading, paymentLoading
                                            } ) {
    const [paymentMethodVerticalTabsIcons, setPaymentMethodVerticalTabsIcons] = useState( 'card' );
    const [amountPayment, setAmountPayment] = useState( 0 );
    const { getAccessTokenSilently } = useAuth0();
    const stripe = useStripe();
    const options = useOptions();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let amountResult = await getPaymentIntentAmount( accessToken );
            if ( !amountResult.error && amountResult.data ) {
                setAmountPayment( amountResult.data );
            }
        })();
    }, [getAccessTokenSilently] );

    const changeUsersTab = ( e, tadName ) => {
        e.preventDefault();
        setPaymentMethodVerticalTabsIcons( tadName );
    };

    const _handlePayment = async () => {
        isPaymentLoading( true );
        const accessToken = await getAccessTokenSilently();
        let lastDefaultPayment = await getDefaultPaymentMethodId( accessToken, vckeySelected );
        if ( !lastDefaultPayment.error && lastDefaultPayment.data ) {

            // Pass the failed PaymentIntent to your client from your server
            stripe.confirmCardPayment( paymentErrorModal, {
                payment_method: lastDefaultPayment.data
            } ).then( async ( result ) => {
                if ( result.error ) {
                    // Show error to your customer
                    console.log( result.error.message );
                    showMessage( label.payment.error4 , 'danger' );

                } else {
                    if ( result.paymentIntent.status === 'succeeded' ) {
                        // The payment is complete!
                        const paymentItentResult = await paymentIntentExecuted( accessToken );

                        if ( paymentItentResult.data ) {
                            closePaymentIntent();
                            showMessage( label.payment.success1, 'primary' );
                        }

                    }
                }
                isPaymentLoading( false );

            } );
        }
    };

    return (
        <Modal size="sm" isOpen={!isNil( paymentErrorModal )}>
            <ModalHeader className="justify-content-center" tag={`h3`}>
                {label.payment.label6} {' '}
                <strong className="text-muted">{amountPayment}€</strong>

            </ModalHeader>
            <ModalBody>

                <Row>
                    <Col md={12}>
                        <Alert color="primary">
                            {label.payment.label7}
                        </Alert>
                        <div className="stripe-logo-img">
                            <img src={stripeLogo} alt="stripe-logo"/>
                        </div>
                        <Nav className="nav-pills-info justify-content-center" pills>
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    href="#pablo"
                                    className={
                                        paymentMethodVerticalTabsIcons === 'card'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={e =>
                                        changeUsersTab( e, 'card' )

                                    }
                                >
                                    {label.payment.card}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    data-toggle="tab"
                                    href="#pablo"
                                    className={
                                        paymentMethodVerticalTabsIcons === 'bancontact'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={e =>
                                        changeUsersTab( e, 'bancontact' )

                                    }
                                >
                                    {label.payment.bancontact}
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={paymentMethodVerticalTabsIcons}>
                            <TabPane tabId="card">
                                <Row>
                                    <Col md={12}>
                                        <Label>{label.payment.label4}</Label>
                                        <FormGroup>
                                            <CardElement options={options}/>
                                        </FormGroup>
                                    </Col>

                                    <Col md="12" className="padding-top-25">
                                        <Button color="primary" type="button"
                                                disabled={paymentLoading}
                                                onClick={_handlePayment}
                                        >
                                            {paymentLoading ? (
                                                <Spinner
                                                    size="sm"
                                                    color="secondary"
                                                />
                                            ) : null}
                                            {' '} {label.payment.activateCard}
                                        </Button>
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tabId="bancontact">

                            </TabPane>
                        </TabContent>
                    </Col>
                </Row>

            </ModalBody>
            <ModalFooter>
                <Link className="btn btn-default" to={`/admin/dashboard`}>{label.notFound.label8}</Link>
            </ModalFooter>
        </Modal>
    )
        ;
}