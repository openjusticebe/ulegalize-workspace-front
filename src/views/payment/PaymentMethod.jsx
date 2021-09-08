import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// reactstrap components
import {
    Alert,
    Button,
    Col,
    FormGroup,
    Input,
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
import PaymentMethodBancontact from './PaymentMethodBancontact';
import PaymentMethodCard from './PaymentMethodCard';
import stripeLogo from '../../assets/img/Powered by Stripe - blurple.svg';
import Card from '@repay/react-credit-card';
import { useAuth0 } from '@auth0/auth0-react';
import { deactivatePayment, getLastCard } from '../../services/PaymentServices';
import CardsDTO from '../../model/payment/CardsDTO';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import ReactLoading from 'react-loading';
import { updateVirtualcab } from '../../services/generalInfo/LawfirmService';
import { validateEmail } from '../../utils/Utils';

const stripePromise = loadStripe( process.env.REACT_APP_STRIPE );

const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );

export default function PaymentMethod( {
                                           label, email, vckeySelected,
                                           lawfirmDto, showMessage,
                                           checkResult,
                                           paymentUpdated,
                                           isPaymentLoading, paymentLoading
                                       } ) {
    const [paymentMethodVerticalTabsIcons, setPaymentMethodVerticalTabsIcons] = useState( 'card' );
    const [popupLawfirmEmail, setPopupLawfirmEmail] = useState( false );
    const [lawfirmEmail, setLawfirmEmail] = useState( lawfirmDto.email );
    const [lastCard, setLastCard] = useState( null );
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

    const changeUsersTab = ( e, tadName ) => {
        e.preventDefault();
        setPaymentMethodVerticalTabsIcons( tadName );
    };

    const _togglePopupLawfirmEmail = () => {
        setPopupLawfirmEmail( !popupLawfirmEmail );
    };

    const _handleDeactivate = async () => {
        isPaymentLoading( true );
        const accessToken = await getAccessTokenSilently();
        const result = await deactivatePayment( accessToken );

        if ( result.error ) {
            showMessage( label.payment.error3, 'danger' );
        } else {
            showMessage( label.payment.success2, 'primary' );
        }
        isPaymentLoading( false );
    };

    const _handleSaveEmailLawfirm = async () => {
        isPaymentLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( (!isNil(lawfirmEmail) || isEmpty(lawfirmEmail) )
            && !validateEmail( lawfirmEmail ) ) {
            isPaymentLoading( false );
            showMessage( label.affaire.error18, 'danger' );
            return;
        }

        lawfirmDto.email = lawfirmEmail;
        const result = await updateVirtualcab( accessToken, lawfirmDto );

        if ( result.error ) {
            showMessage( label.common.error2, 'danger' );
        } else {
            showMessage( label.common.success1, 'primary' );
        }
        _togglePopupLawfirmEmail();

        isPaymentLoading( false );
    };

    return (
        <>
            <Row>
                <Col md={7}>
                    <Alert color="info">
                        <div>{label.payment.label8}</div>
                    </Alert>
                    <Alert color="info">
                        <div>{label.payment.label10}</div>
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

                    <Elements stripe={stripePromise}>
                        <TabContent activeTab={paymentMethodVerticalTabsIcons}>
                            <TabPane tabId="card">
                                <PaymentMethodCard
                                    amount={0}
                                    openPopupLawfirmEmail={_togglePopupLawfirmEmail}
                                    isPaymentLoading={isPaymentLoading}
                                    paymentLoading={paymentLoading}
                                    checkResult={checkResult}
                                    showMessage={showMessage}
                                    lawfirm={lawfirmDto}
                                    email={email}
                                    vckeySelected={vckeySelected}
                                    label={label}
                                />
                            </TabPane>
                            <TabPane tabId="bancontact">
                                <PaymentMethodBancontact
                                    amount={1}
                                    openPopupLawfirmEmail={_togglePopupLawfirmEmail}
                                    isPaymentLoading={isPaymentLoading}
                                    paymentLoading={paymentLoading}
                                    checkResult={checkResult}
                                    showMessage={showMessage}
                                    lawfirm={lawfirmDto}
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
                                        number={`************${lastCard.last4}`}
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
            {popupLawfirmEmail ? (
                <Modal size="md" isOpen={popupLawfirmEmail} toggle={_togglePopupLawfirmEmail}>
                    <ModalHeader toggle={_togglePopupLawfirmEmail}>
                        <h4>{label.payment.label9}</h4>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md={9} lg={9}>
                                <FormGroup>
                                    <Label>{label.generalInfo.email}</Label>
                                    <Input
                                        value={lawfirmEmail}
                                        type="email"
                                        onChange={( e ) => setLawfirmEmail( e.target.value )}
                                        placeholder={label.generalInfo.email}
                                    />
                                </FormGroup>

                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => _togglePopupLawfirmEmail()}>
                            {label.common.close}
                        </Button>
                        <Button color="primary" onClick={_handleSaveEmailLawfirm}>
                            {label.common.save}
                        </Button>
                    </ModalFooter>
                </Modal>
            ) : null}
            {deleteAlert}
        </>
    )
        ;
}