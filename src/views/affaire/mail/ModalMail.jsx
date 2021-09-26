import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
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
    Table,
    TabPane
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import PdfUpload from '../../../components/CustomUpload/PdfUpload';
import {
    getBPostStatus,
    getCosts,
    getCountryCodes,
    getDocumentById,
    getStatus,
    getTotalCost,
    payDocument,
    sendTemporaryDocument,
    updateAddress,
    updateSendingOptions
} from '../../../services/PostBirdServices';
import DocumentDTO from '../../../model/postbird/DocumentDTO';
import Select from 'react-select';
import { getDate } from '../../../utils/DateUtils';
import { getStatusPostBird } from './StatusPostBird';
import ItemDTO from '../../../model/ItemDTO';
import PriceDetail from '../../../model/postbird/PriceDetail';
import ReactLoading from 'react-loading';
import PriceDifference from '../../../model/postbird/PriceDifference';
import { getStatusBPostPostBird } from './StatusBPostPostBird';
import MailPostBirdGenerator from './MailPostBirdGenerator';
import classnames from 'classnames';

const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const isEmpty = require( 'lodash/isEmpty' );
const forEach = require( 'lodash/forEach' );
const upperCase = require( 'lodash/upperCase' );

export default function ModalMail( {
                                       label,
                                       modalPostMailDisplay,
                                       openPostMail,
                                       showMessage,
                                       updateList,
                                       documentId,
                                       dossierId
                                   } ) {
    const [document, setDocument] = useState( null );
    const [countryList, setCountryList] = useState( [] );
    const [isLoading, setIsLoading] = useState( false );
    const [choice, setChoice] = useState( 'addAddressPage' );
    const [costs, setCosts] = useState( null );
    const [totalCost, setTotalCost] = useState( 0 );
    const [bpostStatus, setBpostStatus] = useState( 0 );
    const [horizontalTabs, setHorizontalTabs] = useState( 'document' );
    // use for timer
    const documentIdRef = useRef( documentId );
    const costColor = useRef( 0 );
    const costPrior = useRef( 0 );
    const costRegistred = useRef( 0 );
    const costTwoSide = useRef( 0 );

    const { getAccessTokenSilently } = useAuth0();
// transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultCountry = await getCountryCodes( accessToken );
            let countriesCode;
            if ( resultCountry.data ) {
                countriesCode = map( resultCountry.data, country => {
                    return new ItemDTO( { value: country.iso2, label: country.name } );
                } );
                setCountryList( countriesCode );
            }

            // read the actual document id
            if ( !isNil( documentIdRef.current ) ) {
                let resultDocument = await getDocumentById( accessToken, documentIdRef.current );
                let documentTmp = null;

                if ( resultDocument.error ) {
                    // close with message
                    showMessage( label.mail.error2, 'danger' );
                    openPostMail();
                } else {
                    documentTmp = new DocumentDTO( resultDocument.data );
                    map( countriesCode, country => {
                        if ( country.value === upperCase( documentTmp.countryCode ) ) {
                            documentTmp.countryCodeItem = new ItemDTO( { value: country.name, label: country.label } );
                        }
                    } );

                    setDocument( documentTmp );
                }

                // get cost
                _getCost( documentTmp );
            }
        })();
    }, [getAccessTokenSilently] );

    const _getCost = async ( documentParam ) => {
        if ( !isNil( documentIdRef.current ) ) {

            const accessToken = await getAccessTokenSilently();
            // get cost
            let resultCost = await getCosts( accessToken, documentIdRef.current );

            if ( !resultCost.error ) {
                const costTemp = map( resultCost.data, data => {
                    return new PriceDifference( data );
                } );

                forEach( costTemp, cost => {
                    if ( cost.name === 'color' ) {
                        costColor.current = cost.total;
                    }
                    if ( cost.name === 'base_price_prior_send_cost' ) {
                        costPrior.current = cost.total;
                    }
                    if ( cost.name === 'registered' ) {
                        costRegistred.current = cost.total;
                    }
                    if ( cost.name === 'two-sided' ) {
                        costTwoSide.current = cost.total;
                    }

                } );

                setCosts( costTemp );
            }
            let resultTotalCost = await getTotalCost( accessToken, documentIdRef.current );
            if ( !resultTotalCost.error ) {
                const costTemp = new PriceDetail( resultTotalCost.data );

                setTotalCost( costTemp );
            }

            // document sent
            if ( documentParam && documentParam.status && parseInt( documentParam.status ) >= 13 ) {
                let resultBPostStatus = await getBPostStatus( accessToken, documentIdRef.current );
                if ( !resultBPostStatus.error ) {
                    setBpostStatus( resultBPostStatus.data );
                }
            }
        }
    };
    const _refreshStatus = async () => {
        const accessToken = await getAccessTokenSilently();
        let resultStatus = await getStatus( accessToken, documentIdRef.current );

        if ( !resultStatus.error ) {

            const documentTmp = new DocumentDTO( resultStatus.data );

            // get address info

            setDocument( documentTmp );

            _getCost( documentTmp );
        }

        updateList();
    };

    const _sendDocument = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        document.sendMethod = choice;

        const result = await payDocument( accessToken, documentIdRef.current );

        if ( result.data ) {
            const documentTmp = new DocumentDTO( result.data );
            setDocument( documentTmp );
            showMessage( label.mail.success3, 'primary' );
        } else {
            showMessage( label.mail.error3, 'danger' );
        }
        updateList();

        setIsLoading( false );
    };
    const _updateAddress = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        document.sendMethod = choice;

        const result = await updateAddress( accessToken, documentIdRef.current, document );

        if ( result.data ) {
            const documentTmp = new DocumentDTO( result.data );

            map( countryList, country => {
                if ( country.value === upperCase( documentTmp.countryCode ) ) {
                    documentTmp.countryCodeItem = new ItemDTO( { value: country.name, label: country.label } );
                }
            } );

            setDocument( documentTmp );
            showMessage( label.mail.success1, 'primary' );
            _getCost( documentTmp );
        }

        setIsLoading( false );
    };
    const _updateSendingOptions = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        const result = await updateSendingOptions( accessToken, documentIdRef.current, document );

        if ( result.data ) {
            const documentTmp = new DocumentDTO( result.data );
            setDocument( documentTmp );
            showMessage( label.mail.success2, 'primary' );

            _getCost( documentTmp );
        }

        setIsLoading( false );
    };
    const _uploadDocument = async ( file ) => {
        setIsLoading( true );
        let data = new FormData();
        data.append( 'files', file );
        if ( !isNil( dossierId ) ) {
            data.append( 'dossierId', dossierId );
        }
        const accessToken = await getAccessTokenSilently();

        // check if it's ok
        // if not show document
        // or display cost
        const result = await sendTemporaryDocument( accessToken, data );

        if ( result.data ) {
            const doc = new DocumentDTO( result.data );
            documentIdRef.current = doc.documentId;
            setDocument( doc );
            // maybe use a timer to get the cost
            setTimeout( () => {
                    _refreshStatus();

                    setTimeout( () =>
                            _refreshStatus()
                        , 600 );
                }
                , 1000 );

        }

        setIsLoading( false );
    };
    const changeActiveTab = async ( e, tabState, tadName ) => {
        e.preventDefault();

        if ( tabState === 'horizontalTabs' ) {
            setHorizontalTabs( tadName );
        }

    };

    return (
        <>
            <Modal size="lg" isOpen={modalPostMailDisplay} toggle={openPostMail}>
                <ModalHeader toggle={openPostMail}>
                    <h4 className="modal-title">{label.mail.label1}
                    </h4>
                </ModalHeader>
                <ModalBody>
                    {isNil( document ) && !isNil( documentId ) ? (
                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                    ) : null}
                    <Row>
                        <Col md={12}>
                            {isNil( documentId ) ? (
                                <PdfUpload
                                    isLoading={isLoading}
                                    saveFile={_uploadDocument}
                                    avatar={null}/>
                            ) : null}
                            {/* display once document is uploaded */}
                            {!isNil( document ) && document.status ? (
                                <>
                                    <Row>
                                        <Col md={10}>
                                            <Nav className="nav-pills-info" pills>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#doc"
                                                        className={
                                                            horizontalTabs === 'document'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeActiveTab( e, 'horizontalTabs', 'document' )
                                                        }
                                                    >
                                                        {label.mail.label24}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#opt"
                                                        className={
                                                            horizontalTabs === 'sendOptions'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeActiveTab( e, 'horizontalTabs', 'sendOptions' )
                                                        }
                                                    >
                                                        {label.mail.label25}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        data-toggle="tab"
                                                        href="#sm"
                                                        className={
                                                            horizontalTabs === 'showMail'
                                                                ? 'active'
                                                                : ''
                                                        }
                                                        onClick={e =>
                                                            changeActiveTab( e, 'horizontalTabs', 'showMail' )
                                                        }
                                                    >
                                                        {label.mail.label35}
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                        </Col>
                                    </Row>

                                    <TabContent
                                        className="tab-space no-padding"
                                        activeTab={horizontalTabs}
                                    >
                                        <TabPane tabId="document">
                                            <Row>
                                                <Col md={6}>
                                                    <Card>
                                                        <CardHeader>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <ul>
                                                                <li>{label.mail.label14} <i
                                                                    className={`fa ${parseInt( document.status ) >= 3 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                <li>{label.mail.label18} <i
                                                                    className={`fa ${parseInt( document.status ) >= 5 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                <li>{label.mail.label15} <i
                                                                    className={`fa ${parseInt( document.status ) >= 8 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* PAID */}
                                                                <li>{label.mail.label31} <i
                                                                    className={`fa ${parseInt( document.status ) >= 11 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* PRINTED */}
                                                                <li>{label.mail.label33} <i
                                                                    className={`fa ${parseInt( document.status ) >= 12 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* SEND */}
                                                                <li>{label.mail.label34} <i
                                                                    className={`fa ${parseInt( document.status ) >= 13 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                {/* DELIVERED */}
                                                                <li>{label.mail.label16} <i
                                                                    className={`fa ${parseInt( document.status ) >= 16 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                                <li>{label.mail.label17} <i
                                                                    className={`fa ${parseInt( document.status ) === 19 ? 'fa-check green' : 'fa-times red'}`}/>
                                                                </li>
                                                            </ul>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                                {/* BPost DOCUMENT SENT */}
                                                {!isNil( document ) && parseInt( document.status ) >= 13 ? (
                                                    <Col md={6}>
                                                        <Card>
                                                            <CardHeader>
                                                                {label.mail.bpostStatus}
                                                            </CardHeader>
                                                            <CardBody>
                                                                {getStatusBPostPostBird( bpostStatus, label )}

                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                ) : null}
                                            </Row>
                                            {/* if it's not ok refresh status */}
                                            {!isNil( document ) && document.status !== '8' ? (
                                                <Row>
                                                    <Button
                                                        color="primary"
                                                        disabled={isLoading}
                                                        onClick={_refreshStatus}>
                                                        {isLoading ? (
                                                            <Spinner
                                                                size="sm"
                                                                color="secondary"
                                                            />
                                                        ) : null}
                                                        {' '}{label.payment.refresh}
                                                    </Button>
                                                </Row>
                                            ) : null}
                                            {/* display once the document is send , address ok */}
                                            {!isNil( document ) && (parseInt( document.status ) >= 6) ? (
                                                <>
                                                    {/* recipientName */}
                                                    <FormGroup row className={classnames(  {
                                                        'has-danger': isEmpty(document.recipientName)
                                                    } )}>
                                                        <Label for="recipientName"
                                                               sm={4}>{label.mail.label19}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    recipientName: e.target.value
                                                                } )}
                                                                className="form-control"
                                                                id="recipientName"
                                                                value={document.recipientName}
                                                                name="recipientName"
                                                                type="text"
                                                                placeholder={label.mail.label19}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* streetAndNumber */}
                                                    <FormGroup row className={classnames(  {
                                                        'has-danger': isEmpty(document.streetAndNumber)
                                                    } )}>
                                                        <Label for="streetAndNumber"
                                                               sm={4}>{label.mail.label3}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    streetAndNumber: e.target.value
                                                                } )}
                                                                id="streetAndNumber"
                                                                value={document.streetAndNumber}
                                                                name="streetAndNumber"
                                                                className="form-control"
                                                                type="text"
                                                                placeholder={label.mail.label3}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* postalCode */}
                                                    <FormGroup row className={classnames(  {
                                                        'has-danger': isEmpty(document.postalCode)
                                                    } )}>
                                                        <Label for="codePostal" sm={4}>{label.mail.label4}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                id="postalCode"
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    postalCode: e.target.value
                                                                } )}
                                                                name="postalCode"
                                                                className="form-control"
                                                                type="text"
                                                                value={document.postalCode}
                                                                placeholder={label.mail.label4}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* city */}
                                                    <FormGroup row className={classnames(  {
                                                        'has-danger': isEmpty(document.city)
                                                    } )}>
                                                        <Label for="city" sm={4}>{label.mail.label5}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Input
                                                                id="city"
                                                                onChange={( e ) => setDocument( {
                                                                    ...document,
                                                                    city: e.target.value
                                                                } )}
                                                                name="city"
                                                                className="form-control"
                                                                type="text"
                                                                value={document.city}
                                                                placeholder={label.mail.label5}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* countryCode */}
                                                    <FormGroup row>
                                                        <Label for="country" sm={4}>{label.mail.label6}</Label>
                                                        <Col sm={8} md={8} lg={8} xl={8}>
                                                            <Select
                                                                onChange={( value ) => setDocument( {
                                                                    ...document,
                                                                    countryCode: value.value,
                                                                    countryCodeItem: value
                                                                } )}
                                                                value={document.countryCodeItem}
                                                                name="country"
                                                                options={countryList}
                                                            />
                                                        </Col>
                                                    </FormGroup>
                                                    {/* choice */}
                                                    <Row>
                                                        <Col md={12}>
                                                            <FormGroup check className="form-check-radio">
                                                                <Label check>
                                                                    <Input
                                                                        checked={choice === 'addAddressPage'}
                                                                        defaultValue="option1"
                                                                        id="addAddressPage1"
                                                                        name="addAddressPage1"
                                                                        type="radio"
                                                                        onChange={( e ) => setChoice( 'addAddressPage' )}
                                                                    />
                                                                    <span className="form-check-sign"/>
                                                                    {label.mail.choice1}
                                                                </Label>
                                                            </FormGroup>

                                                        </Col>
                                                        <Col md={12}>
                                                            <FormGroup check className="form-check-radio">
                                                                <Label check>
                                                                    <Input
                                                                        checked={choice === 'overWriteAddressField'}
                                                                        defaultValue="option2"
                                                                        id="overWriteAddressField2"
                                                                        name="overWriteAddressField2"
                                                                        type="radio"
                                                                        onChange={( e ) => setChoice( 'overWriteAddressField' )}
                                                                    />
                                                                    <span className="form-check-sign"/>
                                                                    {label.mail.choice2}
                                                                </Label>
                                                            </FormGroup>

                                                        </Col>
                                                    </Row>
                                                    {/*{ ONLY FOR ADDRESS}*/}
                                                    {!isNil( document )
                                                    && (!isNil( document.status ) && parseInt( document.status ) < 11) ? (
                                                        <Row className="margin-top-30">
                                                            <Col>
                                                                <Button color="default"
                                                                        onClick={_updateAddress}
                                                                        disabled={isNil( document ) || isLoading}
                                                                >
                                                                    {isLoading ? (
                                                                        <Spinner
                                                                            size="sm"
                                                                            color="secondary"
                                                                        />
                                                                    ) : null}
                                                                    {' '}{label.mail.update}
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    ) : null}
                                                </>
                                            ) : null}
                                        </TabPane>
                                        <TabPane tabId="sendOptions">

                                            {/**** SENDING OPTION ****/}
                                            {/**** color ****/}
                                            <Row>
                                                <Col md="12">
                                                    <FormGroup check>
                                                        <Label check>
                                                            <Input
                                                                disabled={parseInt( document.status ) >= 11}
                                                                defaultChecked={document.color}
                                                                type="checkbox"
                                                                onChange={( e ) => {
                                                                    setDocument( {
                                                                        ...document,
                                                                        color: e.target.checked
                                                                    } );
                                                                    document.color = e.target.checked;
                                                                    _updateSendingOptions();
                                                                }}
                                                            />{' '}
                                                            <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label26} ({costColor.current} €)</span>
                                                            </span>
                                                        </Label>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {/**** doubleSide ****/}
                                            <Row>
                                                <Col md="12">
                                                    <FormGroup check>
                                                        <Label check>
                                                            <Input
                                                                defaultChecked={document.twoSided}
                                                                disabled={parseInt( document.status ) >= 11}
                                                                type="checkbox"
                                                                onChange={( e ) => {
                                                                    setDocument( {
                                                                        ...document,
                                                                        twoSided: e.target.checked
                                                                    } );
                                                                    document.twoSided = e.target.checked;
                                                                    _updateSendingOptions();
                                                                }}
                                                            />{' '}
                                                            <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label27} ({costTwoSide.current} €)</span>
                                                            </span>
                                                        </Label>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {/**** registered ****/}
                                            <Row>
                                                <Col md="12">
                                                    <FormGroup check>
                                                        <Label check>
                                                            <Input
                                                                defaultChecked={document.registered}
                                                                disabled={parseInt( document.status ) >= 11}
                                                                type="checkbox"
                                                                onChange={( e ) => {
                                                                    setDocument( {
                                                                        ...document,
                                                                        registered: e.target.checked
                                                                    } );
                                                                    document.registered = e.target.checked;
                                                                    _updateSendingOptions();
                                                                }}
                                                            />{' '}
                                                            <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label28} ({costRegistred.current} €)</span>
                                                            </span>
                                                        </Label>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {/**** prior ****/}
                                            <Row>
                                                <Col md="12">
                                                    <FormGroup check>
                                                        <Label check>
                                                            <Input
                                                                defaultChecked={document.prior}
                                                                type="checkbox"
                                                                disabled={parseInt( document.status ) >= 11}
                                                                onChange={( e ) => {
                                                                    setDocument( {
                                                                        ...document,
                                                                        prior: e.target.checked
                                                                    } );
                                                                    document.prior = e.target.checked;
                                                                    _updateSendingOptions();
                                                                }}
                                                            />{' '}
                                                            <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.mail.label29} ({costPrior.current} €)</span>
                                                            </span>
                                                        </Label>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                        </TabPane>

                                        <TabPane tabId="showMail">

                                            {/**** PREVIEW DOCUMENT ****/}
                                            {horizontalTabs === 'showMail' ? (
                                                <Row>
                                                    <Col>
                                                        <MailPostBirdGenerator
                                                            showMessage={showMessage}
                                                            documentId={documentIdRef.current}
                                                            label={label}
                                                        />
                                                    </Col>
                                                </Row>
                                            ) : null}
                                        </TabPane>
                                    </TabContent>
                                    <Table>
                                        <tr>
                                            <th>#</th>
                                            {/* street and number*/}
                                            <th>{label.mail.label3}</th>
                                            {/* city */}
                                            <th>{label.mail.label5}</th>
                                            {/* status */}
                                            <th>{label.mail.label7}</th>
                                            {/* date */}
                                            <th>{label.mail.label8}</th>
                                        </tr>
                                        <tbody>

                                        <tr>
                                            <td>
                                                {document.documentName}
                                            </td>
                                            <td>
                                                {document.streetAndNumber}
                                            </td>
                                            <td>
                                                {document.city}
                                            </td>
                                            <td>
                                                {getStatusPostBird( document.status, label )}
                                            </td>
                                            <td>
                                                {getDate( document.creDate )}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </>
                            ) : null}
                        </Col>
                        <Col md={3}>
                            {/* GET COST */}
                            {!isNil( costs ) && !isNil( document ) && document.status
                            && parseInt( document.status ) >= 0 && parseInt( document.status ) < 11 ? (
                                <>
                                    <h4>{label.mail.label23}</h4>
                                    <strong>{totalCost.totalPriceInVat} € </strong> ( {totalCost.totalPriceExVat} € {label.mail.label22})
                                </>
                            ) : null}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="default"
                            onClick={openPostMail}>{label.common.close}</Button>
                    {/*{ ONLY TO SEND }*/}
                    {!isNil( document )
                    && (!isNil( document.status ) && parseInt( document.status ) >= 8) ? (
                        <Button color="primary" type="button"
                            //9 = await , >= 11 payment ok
                                disabled={(parseInt( document.status ) === 9
                                    || parseInt( document.status ) >= 11)}
                            //disabled={(isNil( document ) || parseInt( document.status ) > 12 || parseInt( document.status ) >= 8)
                                onClick={_sendDocument}
                        >
                            {isLoading ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '} {label.common.send}
                        </Button>
                    ) : null}
                </ModalFooter>
            </Modal>
        </>
    );
}

