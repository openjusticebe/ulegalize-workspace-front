import React, { useEffect, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';

// reactstrap components
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from 'reactstrap';
import { getOptionInfoNotification, getOptionNotification } from '../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import { useAuth0 } from '@auth0/auth0-react';
import PaymentMethod from './payment/PaymentMethod';
import Transactions from './payment/Transactions';
import { checkPaymentActivated, getLastPaymentError, updateInvoiceAddress } from '../services/PaymentServices';
import PaymentMethodToPay from './payment/PaymentMethodToPay';

import { loadStripe } from '@stripe/stripe-js';
import ReactLoading from 'react-loading';
import PaymentAddress from './payment/PaymentAddress';
import { validateEmail } from '../utils/Utils';

const stripePromise = loadStripe( process.env.REACT_APP_STRIPE );

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

export default function Payment( props ) {
    const {
        label,
        location,
        history,
        email,
        currency,
        vckeySelected
    } = props;
    const [verticalTabsIcons, setVerticalTabsIcons] = useState( 'payment' );
    const notificationAlert = useRef( null );
    const [paymentLoading, setPaymentLoading] = useState( false );
    const [paymentLoadingData, setPaymentLoadingData] = useState( true );
    const [paymentErrorModal, setPaymentErrorModal] = useState( null );
    const paymentUpdated = useRef( false );
    const checkResultRef = useRef( false );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            // check if email/address is set in the workspace
            let checkResult = await checkPaymentActivated( accessToken );
            let lastErrorResult = await getLastPaymentError( accessToken );

            if ( lastErrorResult.data && !isEmpty( lastErrorResult.data ) ) {
                setPaymentErrorModal( lastErrorResult.data );
            }
            checkResultRef.current = checkResult.data;
            setPaymentLoadingData( false );

        })();
    }, [getAccessTokenSilently] );

    useEffect( () => {
        (async () => {
            if ( location.state && location.state.stripe === true ) {
                notificationAlert.current.notificationAlert( getOptionInfoNotification( label.etat.success4 ) );
                history.replace();
            }
            let paramsLocation = new URLSearchParams( location.search );
            if ( paramsLocation
                && paramsLocation.get( 'successstripe' ) === 'success'
                && paramsLocation.get( 'redirect_status' ) !== 'failed' ) {
                // redirct
                props.history.push( { pathname: `/admin/payment`, state: { stripe: true } } );
            }

        })();
    }, [location.state] );

    const _isPaymentLoading = async ( value, checkActivated ) => {
        // only check if the payment is not loading
        if ( checkActivated === true ) {

            const accessToken = await getAccessTokenSilently();
            let checkResult = await checkPaymentActivated( accessToken );

            checkResultRef.current = checkResult.data;
        }
        paymentUpdated.current = !paymentUpdated.current;
        setPaymentLoading( value );

    };

    const _closePaymentIntent = () => {
        setPaymentErrorModal( null );

    };
    const changeUsersTab = ( e, tadName ) => {
        e.preventDefault();
        setVerticalTabsIcons( tadName );
    };
    const _showMessage = ( message, type ) => {
        notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
    };

    const _handleUpdateLawfirmAddress = async ( lawfirmInvoice ) => {
        setPaymentLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( (!isNil( lawfirmInvoice.email ) || isEmpty( lawfirmInvoice.email ))
            && !validateEmail( lawfirmInvoice.email ) ) {
            setPaymentLoading( false );
            _showMessage( label.affaire.error18, 'danger' );
            return false;
        }
        if ( (isNil( lawfirmInvoice.city ) || isEmpty( lawfirmInvoice.city )) ) {
            setPaymentLoading( false );
            _showMessage( label.affaire.error22, 'danger' );
            return false;
        }
        if ( (isNil( lawfirmInvoice.street ) || isEmpty( lawfirmInvoice.street )) ) {
            setPaymentLoading( false );
            _showMessage( label.affaire.error23, 'danger' );
            return false;
        }
        if ( (isNil( lawfirmInvoice.countryCode ) || isEmpty( lawfirmInvoice.countryCode )) ) {
            setPaymentLoading( false );
            _showMessage( label.affaire.error24, 'danger' );
            return false;
        }

        const resultUpdate = await updateInvoiceAddress( accessToken, lawfirmInvoice );

        if ( !resultUpdate.error ) {
            _showMessage( label.common.success1, 'primary' );
        } else if ( resultUpdate.error && resultUpdate.data === 403 ) {
            _showMessage( label.payment.error7, 'danger' );
            setPaymentLoading( false );

            return false;
        } else {
            _showMessage( label.payment.error1, 'danger' );
            setPaymentLoading( false );

            return false;
        }
        setPaymentLoading( false );
        return true;
    };

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">{label.payment.label1}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                {paymentLoadingData ? (
                                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                ) : (
                                    <Row>
                                        <Col lg="12" md={12}>
                                            {/* color-classes: "nav-pills-primary", "nav-pills-info", "nav-pills-success", "nav-pills-warning","nav-pills-danger" */}
                                            <Nav className="nav-pills-info" pills>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#pablo"
                                                        className={
                                                            verticalTabsIcons === 'payment'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeUsersTab( e, 'payment' )

                                                        }
                                                    >
                                                        <i className="tim-icons icon-credit-card"/>
                                                        {label.payment.label1}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#pablo"
                                                        className={
                                                            verticalTabsIcons === 'transaction'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeUsersTab( e, 'transaction' )

                                                        }
                                                    >
                                                        <i className="tim-icons icon-lock-circle"/>
                                                        {label.payment.label2}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#"
                                                        className={
                                                            verticalTabsIcons === 'address'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeUsersTab( e, 'address' )

                                                        }
                                                    >
                                                        <i className="tim-icons icon-world"/>
                                                        {label.payment.label11}
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                            <TabContent activeTab={verticalTabsIcons}>
                                                <TabPane tabId="payment">
                                                    <PaymentMethod
                                                        paymentUpdated={paymentUpdated.current}
                                                        isPaymentLoading={_isPaymentLoading}
                                                        handleUpdateLawfirmAddress={_handleUpdateLawfirmAddress}
                                                        paymentLoading={paymentLoading}
                                                        checkResult={checkResultRef.current}
                                                        currency={currency}
                                                        showMessage={_showMessage}
                                                        email={email}
                                                        vckeySelected={vckeySelected}
                                                        label={label}
                                                    />
                                                </TabPane>
                                                <TabPane tabId="transaction">
                                                    {verticalTabsIcons === 'transaction' ? (
                                                        <Transactions label={label}/>
                                                    ) : null}
                                                </TabPane>
                                                <TabPane tabId="address">
                                                    {verticalTabsIcons === 'address' ? (
                                                        <Row>
                                                            <Col lg={8}>
                                                                <PaymentAddress
                                                                    isPopup={false}
                                                                    togglePopupLawfirmEmail={null}
                                                                    paymentLoading={paymentLoading}
                                                                    vckeySelected={vckeySelected}
                                                                    checkResult={checkResultRef.current}
                                                                    label={label}
                                                                    showMessage={_showMessage}
                                                                    handleUpdateLawfirmAddress={_handleUpdateLawfirmAddress}
                                                                />
                                                            </Col>
                                                        </Row>

                                                    ) : null}
                                                </TabPane>
                                            </TabContent>
                                        </Col>
                                    </Row>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                {!isNil( paymentErrorModal ) ? (
                    <Elements stripe={stripePromise}>

                        <PaymentMethodToPay
                            paymentUpdated={paymentUpdated.current}
                            isPaymentLoading={_isPaymentLoading}
                            closePaymentIntent={_closePaymentIntent}
                            paymentLoading={paymentLoading}
                            paymentErrorModal={paymentErrorModal}
                            checkResult={checkResultRef.current}
                            currency={currency}
                            showMessage={_showMessage}
                            email={email}
                            vckeySelected={vckeySelected}
                            label={label}
                        />
                    </Elements>
                ) : null}
            </div>
        </>
    );
}