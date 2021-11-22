import React, { useEffect, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// reactstrap components
import { Alert, Button, Col, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from 'reactstrap';
import PaymentMethodBancontact from './PaymentMethodBancontact';
import PaymentMethodCard from './PaymentMethodCard';
import stripeLogo from '../../assets/img/Powered by Stripe - blurple.svg';
import Card from '@repay/react-credit-card';
import { useAuth0 } from '@auth0/auth0-react';
import { countTransaction, deactivatePayment, getLastCard } from '../../services/PaymentServices';
import CardsDTO from '../../model/payment/CardsDTO';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import ReactLoading from 'react-loading';

const stripePromise = loadStripe( process.env.REACT_APP_STRIPE );

const isNil = require( 'lodash/isNil' );

function useInterval( callback, delay ) {
    const savedCallback = useRef();

    useEffect( () => {
        savedCallback.current = callback;
    } );

    useEffect( () => {
        function tick() {
            savedCallback.current();
        }

        if ( delay !== null ) {
            let id = setInterval( tick, delay );
            return () => clearInterval( id );
        }
    }, [delay] );
}

export default function PaymentMethod( {
                                           label, email, vckeySelected,
                                           showMessage,
                                           checkResult,
                                           handleUpdateLawfirmAddress,
                                           paymentUpdated,
                                           isPaymentLoading, paymentLoading
                                       } ) {
    const [paymentMethodVerticalTabsIcons, setPaymentMethodVerticalTabsIcons] = useState( 'bancontact' );
    const [lastCard, setLastCard] = useState( null );
    // cardRegisterd is being registered so let's poll
    const cardRegisterd = useRef( false );
    const [deleteAlert, setDeleteAlert] = useState( null );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            if ( checkResult === true && !paymentLoading ) {
                let lastCardResult = await getLastCard( accessToken, vckeySelected );
                if ( !lastCardResult.error && lastCardResult.data ) {
                    setLastCard( new CardsDTO( lastCardResult.data ) );
                }
            } else {
                setLastCard( null );
            }
        })();
    }, [getAccessTokenSilently, checkResult, paymentUpdated] );

    useInterval( async () => {
        const accessToken = await getAccessTokenSilently();
        let lastCardResult = await getLastCard( accessToken, vckeySelected );
        if ( !lastCardResult.error && lastCardResult.data ) {
            cardRegisterd.current = false;
            isPaymentLoading( false );
            setLastCard( new CardsDTO( lastCardResult.data ) );
        }
    }, cardRegisterd.current === true ? 2000 : null );

    const changeUsersTab = ( e, tadName ) => {
        e.preventDefault();
        setPaymentMethodVerticalTabsIcons( tadName );
    };

    const _handleUpdateLawfirmAddress = async ( lawfirm ) => {
        return await handleUpdateLawfirmAddress( lawfirm );
    };
    const _handleDeactivate = async () => {
        isPaymentLoading( true );
        const accessToken = await getAccessTokenSilently();

        const resultCount = await countTransaction( accessToken );

        if ( resultCount.error || resultCount.data !== 0 ) {
            showMessage( label.payment.error6, 'danger' );
        } else {
            const result = await deactivatePayment( accessToken );

            if ( result.error ) {
                showMessage( label.payment.error3, 'danger' );
            } else {
                showMessage( label.payment.success2, 'primary' );
            }
        }

        isPaymentLoading( false );
    };

    const _isPaymentLoading = async ( value, checkActivated ) => {
        // only if it's false fire interval
        if ( checkActivated === true ) {
            cardRegisterd.current = true;

        }

        isPaymentLoading( value );
    };

    return (
        <>
            <Row>
                <Col md={7}>
                    <Alert color="info">
                        <div>{label.payment.label8}</div>
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
                    </Nav>

                    <Elements stripe={stripePromise}>
                        <TabContent activeTab={paymentMethodVerticalTabsIcons}>
                            <TabPane tabId="card">
                                <PaymentMethodCard
                                    amount={0}
                                    isPaymentLoading={_isPaymentLoading}
                                    paymentLoading={paymentLoading}
                                    checkResult={checkResult}
                                    showMessage={showMessage}
                                    handleUpdateLawfirmAddress={_handleUpdateLawfirmAddress}
                                    email={email}
                                    vckeySelected={vckeySelected}
                                    label={label}
                                />
                            </TabPane>
                            <TabPane tabId="bancontact">
                                <PaymentMethodBancontact
                                    amount={1}
                                    isPaymentLoading={_isPaymentLoading}
                                    paymentLoading={paymentLoading}
                                    checkResult={checkResult}
                                    handleUpdateLawfirmAddress={_handleUpdateLawfirmAddress}
                                    showMessage={showMessage}
                                    email={email}
                                    vckeySelected={vckeySelected}
                                    label={label}
                                />
                            </TabPane>
                        </TabContent>
                    </Elements>
                </Col>
                <Col md={5}>
                    {/* if the payment is loading => load the card*/}
                    {paymentLoading ? (
                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                        ) :

                        lastCard ?
                            (
                                <>
                                    <Card
                                        name={lastCard.name}
                                        number={`************${!isNil( lastCard.last4 ) ? lastCard.last4 : ''}`}
                                        expiration={`${lastCard.exp_month}/${lastCard.exp_year}`}
                                        cvc={lastCard.cvc_check}
                                        type={lastCard.brand}
                                    />
                                    <Button color="primary" type="button"
                                            disabled={paymentLoading === true}
                                            onClick={() => {
                                                setDeleteAlert( <ReactBSAlert
                                                    warning
                                                    style={{ display: 'block', marginTop: '30px' }}
                                                    title={label.common.label10}
                                                    onConfirm={() => {
                                                        _handleDeactivate();
                                                        setDeleteAlert( null );
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
                                    >
                                        {paymentLoading ? (
                                            <Spinner
                                                size="sm"
                                                color="secondary"
                                            />
                                        ) : null}
                                        {' '} {label.payment.label5}
                                    </Button>
                                </>
                            ) : null
                    }

                </Col>
            </Row>
            {deleteAlert}
        </>
    )
        ;
}