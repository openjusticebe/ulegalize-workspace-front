import React, { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Modal,
    ModalFooter,
    Nav,
    NavItem,
    NavLink,
    Row,
    Spinner,
    TabContent,
    TabPane
} from 'reactstrap';
import { Tooltip } from '@material-ui/core';
import Classement from './Classement';
import ImageUpload from '../../../components/CustomUpload/ImageUpload';
import { getAlpha2CountryList, getCurrencies } from '../../../services/SearchService';
import Select from 'react-select';
import fr from 'date-fns/locale/fr';
import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import LawfirmDTO from '../../../model/admin/generalInfo/LawfirmDTO';
import LawfirmConfigDTO from '../../../model/admin/generalInfo/LawfirmConfigDTO';
import {
    getVirtualcabById,
    updateVirtualcab,
    uploadImageVirtualcab
} from '../../../services/generalInfo/LawfirmService';
import {
    addVirtualcabConfig,
    getVirtualcabCaseFolders,
    removeVirtualcabConfig
} from '../../../services/generalInfo/LawfirmConfigService';
import { getOptionNotification } from '../../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import ItemDTO from '../../../model/ItemDTO';

import '../../../css/style.css';

import { Anchor } from 'antd';
import { startDropbox, startOnedrive } from '../../../services/DriveService';
import { validateEmail } from '../../../utils/Utils';

const { Link } = Anchor;

// nodejs library that concatenates classes
const map = require( 'lodash/map' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );
;

export default function GeneralInfo( props ) {
    const {
        vc_key,
        label,
        currency,
        vckeySelected,
        refreshUserProfile
    } = props;

    const { getAccessTokenSilently } = useAuth0();

    const [countrySelect, setCountrySelect] = useState( [] );
    const [virtualCab, setVirtualCab] = useState( new LawfirmDTO() );
    const [currencyList, setCurrencyList] = useState( [] );
    const [isLoading, setIsLoading] = useState( false );

    const [virtualCabConfig, setVirtualCabConfig] = useState( new LawfirmConfigDTO() );
    const [virtualCabConfigList, setVirtualCabConfigList] = useState( [] );
    const notificationAlert = useRef( null );

    const [horizontalTabs, setHorizontalTabs] = useState( 'general' );
    const [hideOneDriveBtn, setHideOneDriveBtn] = useState( true );
    const [hideDropboxBtn, setHideDropboxBtn] = useState( true );
    const [togglePopupVirtualCab, setTogglePopupVirtualCab] = useState( false );

    const [register, setRegister] = useState( '' );

    useEffect( () => {
        (async () => {

            const accessToken = await getAccessTokenSilently();
            let virtualCabtResult = await getVirtualcabById( accessToken, vc_key );
            let virtualCabConfigResult = await getVirtualcabCaseFolders( accessToken, vc_key );
            let resultCountry = await getAlpha2CountryList( accessToken );

            let virtualCabData = virtualCab;

            if ( !virtualCabtResult.error ) {
                virtualCabData = new LawfirmDTO( virtualCabtResult.data, label );
            }

            let virtualCabDataConfig = virtualCabConfig;
            if ( !virtualCabConfigResult.error ) {

                if ( virtualCabConfigResult.data.length > 0 ) {
                    setVirtualCabConfigList( virtualCabConfigResult.data );
                }
            }

            let countr = map( resultCountry.data, data => {

                //hardcoded must be fill in related to the countryCode cab
                if ( virtualCabData.countryCode === data.value ) {
                    virtualCabData.countryItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setCountrySelect( countr );

            const resultCurrency = await getCurrencies( accessToken );

            if ( !resultCurrency.error ) {
                const curr = map( resultCurrency.data, data => {
                    if ( virtualCabData.currency === data.value ) {
                        virtualCabData.currencyItem = data;
                    }
                    return new ItemDTO( data );
                } );
                setCurrencyList( curr );
            }

            virtualCabData.key = vc_key;
            virtualCabDataConfig.key = vc_key;

            setVirtualCab( virtualCabData );
            setVirtualCabConfig( virtualCabDataConfig );

            /***************************** */

            let VcDriveType = virtualCabData.driveType;
            if ( VcDriveType ) {
                handleDriveChoice( null, VcDriveType );
            }

        })();
    }, [getAccessTokenSilently, vckeySelected] );

    const _associateDrive = async () => {
        let accessToken = await getAccessTokenSilently();
        let result = await startDropbox( accessToken );

        if ( !result.error && result.data !== '' ) {
            window.location = result.data;
        }
    };

    const _associateOneDrive = async () => {
        let accessToken = await getAccessTokenSilently();
        let result = await startOnedrive( accessToken );

        if ( !result.error && result.data !== '' ) {
            window.location = result.data;
        }
    };

    // this function is to open the VirtualCab Extra Info modal
    const togglePopupVirtualCabi = () => {
        setTogglePopupVirtualCab( !togglePopupVirtualCab );
    };

    const _updateGeneralVirtualCab = async () => {

        if ( virtualCab.email && !validateEmail( virtualCab.email ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error18, 'danger' ) );
            return;
        }

        //setVirtualCab(virtualCab);
        let accessToken = await getAccessTokenSilently();
        let result = await getVirtualcabById( accessToken, vc_key );
        let updatedCab = result.data;

        updatedCab.vckey = virtualCab.vckey;
        updatedCab.abbreviation = virtualCab.abbreviation;
        updatedCab.objetsocial = virtualCab.objetsocial;
        updatedCab.numentreprise = virtualCab.numentreprise;
        updatedCab.email = virtualCab.email;
        updatedCab.currency = virtualCab.currency;
        updatedCab.currencyItem = virtualCab.currencyItem;

        let resultUpdate = await updateVirtualcab( accessToken, updatedCab );
        if ( !resultUpdate.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
    };
    const _updateAddressVirtualCab = async () => {

        //setVirtualCab(virtualCab);
        let accessToken = await getAccessTokenSilently();
        let result = await getVirtualcabById( accessToken, vc_key );
        let updatedCab = result.data;

        updatedCab.street = virtualCab.street;
        updatedCab.city = virtualCab.city;
        updatedCab.postalCode = virtualCab.postalCode;
        updatedCab.countryCode = virtualCab.countryCode;

        let resultUpdate = await updateVirtualcab( accessToken, updatedCab );
        if ( !resultUpdate.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
    };

    const _updateContactVirtualCab = async () => {

        //setVirtualCab(virtualCab);
        let accessToken = await getAccessTokenSilently();
        let result = await getVirtualcabById( accessToken, vc_key );
        let updatedCab = result.data;

        updatedCab.phoneNumber = virtualCab.phoneNumber;
        updatedCab.fax = virtualCab.fax;
        updatedCab.website = virtualCab.website;

        let resultUpdate = await updateVirtualcab( accessToken, updatedCab );
        if ( !resultUpdate.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
    };

    const _updateHRateVirtualCab = async () => {

        //setVirtualCab(virtualCab);
        let accessToken = await getAccessTokenSilently();
        let result = await getVirtualcabById( accessToken, vc_key );
        let updatedCab = result.data;

        updatedCab.couthoraire = virtualCab.couthoraire;

        let resultUpdate = await updateVirtualcab( accessToken, updatedCab );
        if ( !resultUpdate.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
    };

    const _updateVirtualCabNotification = async () => {

        setIsLoading( true );

        let accessToken = await getAccessTokenSilently();
        let result = await getVirtualcabById( accessToken, vc_key );
        let updatedCab = result.data;

        updatedCab.isNotification = virtualCab.isNotification;

        let resultUpdate = await updateVirtualcab( accessToken, updatedCab );

        if ( !resultUpdate.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }

        setIsLoading( false );
    };

    const _uploadPicture = async ( file ) => {
        const accessToken = await getAccessTokenSilently();

        let formData = new FormData();
        formData.append( 'files', file );

        let result = await uploadImageVirtualcab( accessToken, formData );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.profile.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
    };

    const _updateDriveVirtualCab = async () => {

        //setVirtualCab(virtualCab);
        let accessToken = await getAccessTokenSilently();
        let result = await getVirtualcabById( accessToken, vc_key );
        let updatedCab = result.data;

        updatedCab.driveType = virtualCab.driveType;

        let resultUpdate = await updateVirtualcab( accessToken, updatedCab );
        if ( !resultUpdate.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
        // refresh
        refreshUserProfile()
    };

    const _addVirtualCabConfig = async ( newVirtualCabConfig ) => {
        let accessToken = await getAccessTokenSilently();

        let updatedCabConfig = new LawfirmConfigDTO();

        updatedCabConfig.vc_key = virtualCab.vckey;
        updatedCabConfig.parameter = newVirtualCabConfig.parameter;
        updatedCabConfig.description = newVirtualCabConfig.description;

        let result = await addVirtualcabConfig( accessToken, updatedCabConfig );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
        //Reload List
        await loadVirtualCabConfigList( accessToken );
    };
    const loadVirtualCabConfigList = async ( accessToken ) => {
        let virtualCabConfigResult = await getVirtualcabCaseFolders( accessToken, vc_key );

        if ( !virtualCabConfigResult.error ) {

            if ( virtualCabConfigResult.data.length > 0 ) {
                setVirtualCabConfigList( virtualCabConfigResult.data );
            }
        }
    };
    const removeClassement = async ( virtualCabConfigName ) => {
        let accessToken = await getAccessTokenSilently();

        await removeVirtualcabConfig( accessToken, virtualCabConfigName );

        //Reload List
        await loadVirtualCabConfigList( accessToken );
    };

    // with this function we change the active tab for all the tabs in this page
    const changeActiveTab = ( e, tabState, tadName ) => {
        e.preventDefault();
        setHorizontalTabs( tadName );
    };

    //With this function we change the chosen DriveType
    const handleDriveChoice = ( event, dbDriveString ) => {
        //console.log(event.currentTarget.value)
        if ( !event && dbDriveString ) {
            if ( dbDriveString === 'dropbox' ) {
                setHideDropboxBtn( false );
                setHideOneDriveBtn( true );
            } else if ( dbDriveString === 'openstack' ) {
                setHideDropboxBtn( true );
                setHideOneDriveBtn( true );
            } else if ( dbDriveString === 'onedrive' ) {
                setHideDropboxBtn( true );
                setHideOneDriveBtn( false );
            }
        }
        if ( event && !dbDriveString ) {
            setVirtualCab( { ...virtualCab, driveType: event.target.value } );
            if ( event.currentTarget.value === 'dropbox' ) {
                setHideDropboxBtn( false );
                setHideOneDriveBtn( true );
            } else if ( event.currentTarget.value === 'openstack' ) {
                setHideDropboxBtn( true );
                setHideOneDriveBtn( true );
            } else if ( event.currentTarget.value === 'onedrive' ) {
                setHideDropboxBtn( true );
                setHideOneDriveBtn( false );
            }
        }
    };

    const handleCreateClassementItem = event => {
        if ( event.key === 'Enter' ) {
            event.preventDefault();
            //creer le nvx classement
            const newVirtualCabConfig = {
                description: event.currentTarget.value,
                parameter: 'CASEFOLDER'
            };
            _addVirtualCabConfig( newVirtualCabConfig );
            setRegister( '' );
        }
    };
    const handleCabConfigChange = ( event ) => {
        setRegister( event.target.value );
    };
    const handleSubmit = ( event ) => {
        event.preventDefault();

        const newVirtualCabConfig = {
            description: register,
            parameter: 'CASEFOLDER'
        };
        _addVirtualCabConfig( newVirtualCabConfig );
        setRegister( '' );
    };

    const hideDBBtn = hideDropboxBtn ? { display: 'none' } : { display: 'inline-block' };//hides dropboxButton
    const hideODBtn = hideOneDriveBtn ? { display: 'none' } : { display: 'inline-block' };//hides oneDriveButton

    return (<>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">{label.generalInfo.label1}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Nav className="nav-pills-info" pills>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalTabs === 'general'
                                                    ? 'active'
                                                    : ''
                                            }
                                            onClick={e =>
                                                changeActiveTab( e, 'horizontalTabs', 'general' )
                                            }
                                        >
                                            {label.generalInfo.label2}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalTabs === 'Adresse'
                                                    ? 'active'
                                                    : ''
                                            }
                                            onClick={e =>
                                                changeActiveTab( e, 'horizontalTabs', 'Adresse' )
                                            }
                                        >
                                            {label.generalInfo.label3}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalTabs === 'Contact'
                                                    ? 'active'
                                                    : ''
                                            }
                                            onClick={e =>
                                                changeActiveTab( e, 'horizontalTabs', 'Contact' )
                                            }
                                        >
                                            {label.generalInfo.label4}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            onClick={togglePopupVirtualCabi}
                                        >
                                            {label.generalInfo.label5}
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent
                                    className="tab-space"
                                    activeTab={horizontalTabs}
                                >
                                    <TabPane tabId="general">
                                        <Form action="/" className="form-horizontal" method="get">
                                            <Row>

                                                <Col md="5" sm={4}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.key}</Label>
                                                        <Input
                                                            disabled
                                                            value={virtualCab.vckey}
                                                            type="text"
                                                            onChange={e => setVirtualCab( {
                                                                ...virtualCab,
                                                                vc_key: e.target.value
                                                            } )}
                                                            placeholder={props.label.generalInfo.key}/>
                                                    </FormGroup>
                                                </Col>

                                                <Col md="3" sm={2}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.abbreviation}</Label>
                                                        <Input
                                                            maxLength={9}
                                                            value={virtualCab.abbreviation}
                                                            placeholder={props.label.generalInfo.abbreviation}
                                                            onChange={e => setVirtualCab( {
                                                                ...virtualCab,
                                                                abbreviation: e.target.value
                                                            } )}
                                                            type="text"/>
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4" sm={4}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.socialObject}</Label>
                                                        <Input
                                                            value={virtualCab.objetsocial}
                                                            onChange={e => setVirtualCab( {
                                                                ...virtualCab,
                                                                objetsocial: e.target.value
                                                            } )}
                                                            placeholder={props.label.generalInfo.socialObject}
                                                            type="text"/>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md="3" sm={3}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.numEntreprise}</Label>
                                                        <Input
                                                            value={virtualCab.numentreprise}
                                                            onChange={e => setVirtualCab( {
                                                                ...virtualCab,
                                                                numentreprise: e.target.value
                                                            } )}
                                                            placeholder={props.label.generalInfo.numEntreprise}
                                                            type="text"/>
                                                    </FormGroup>
                                                </Col>

                                                <Col md="5" sm={5}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.email}</Label>
                                                        <Input
                                                            value={virtualCab.email}
                                                            type="email"
                                                            onChange={e => setVirtualCab( {
                                                                ...virtualCab,
                                                                email: e.target.value
                                                            } )}
                                                            placeholder={props.label.generalInfo.email}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3" sm={4}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.currency}</Label>
                                                        <Select placeholder={props.label.generalInfo.currency}
                                                                type="text"
                                                                value={virtualCab.currencyItem}
                                                                options={currencyList}
                                                                onChange={value => setVirtualCab( {
                                                                    ...virtualCab,
                                                                    currency: value.value,
                                                                    currencyItem: value
                                                                } )}/>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={{ size: 2, offset: 9 }} sm={{ size: 4, offset: 7 }}>
                                                    <FormGroup>
                                                        <Button color="primary float-right"
                                                                onClick={_updateGeneralVirtualCab}><i
                                                            className="fa fa-check"/> {label.common.save}</Button>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </TabPane>
                                    <TabPane tabId="Adresse">
                                        <Form action="/" className="form-horizontal" method="get">
                                            <Row>

                                                <Col md="5" sm={4}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.address}</Label>
                                                        <Input placeholder={props.label.generalInfo.address} type="text"
                                                               value={virtualCab.street}
                                                               onChange={e => setVirtualCab( {
                                                                   ...virtualCab,
                                                                   street: e.target.value
                                                               } )}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4" sm={4}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.city}</Label>
                                                        <Input placeholder={props.label.generalInfo.city} type="text"
                                                               value={virtualCab.city}
                                                               onChange={e => setVirtualCab( {
                                                                   ...virtualCab,
                                                                   city: e.target.value
                                                               } )}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="3" sm={2}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.postalCode}</Label>
                                                        <Input placeholder={props.label.generalInfo.postalCode}
                                                               type="text"
                                                               value={virtualCab.postalCode}
                                                               onChange={e => setVirtualCab( {
                                                                   ...virtualCab,
                                                                   postalCode: e.target.value
                                                               } )}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md="4" sm={4}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.country}</Label>
                                                        <Select
                                                            value={virtualCab.countryItem}
                                                            className="react-select info"
                                                            classNamePrefix="react-select"
                                                            name="singleSelect"
                                                            onChange={value => setVirtualCab( {
                                                                ...virtualCab,
                                                                countryItem: value,
                                                                countryCode: value.value,
                                                            } )}
                                                            options={countrySelect}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={{ size: 2, offset: 9 }} sm={{ size: 4, offset: 7 }}>
                                                    <FormGroup>
                                                        <Button color="primary float-right"
                                                                onClick={_updateAddressVirtualCab}><i
                                                            className="fa fa-check"/> {label.common.save}</Button>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </TabPane>
                                    <TabPane tabId="Contact">
                                        <Form action="/" className="form-horizontal" method="get">
                                            <Row>

                                                <Col md="4" sm={3}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.telephone.label1}</Label>
                                                        <Input
                                                            placeholder={props.label.generalInfo.telephone.placeholder}
                                                            type="text"
                                                            value={virtualCab.phoneNumber}
                                                            onChange={e => setVirtualCab( {
                                                                ...virtualCab,
                                                                phoneNumber: e.target.value
                                                            } )}
                                                        />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4" sm={3}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.fax.label1}</Label>
                                                        <Input placeholder={props.label.generalInfo.fax.placeholder}
                                                               type="text"
                                                               value={virtualCab.fax}
                                                               onChange={e => setVirtualCab( {
                                                                   ...virtualCab,
                                                                   fax: e.target.value
                                                               } )}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4" sm={6}>
                                                    <FormGroup>
                                                        <Label>{props.label.generalInfo.website}</Label>
                                                        <Input placeholder={props.label.generalInfo.website} type="text"
                                                               value={virtualCab.website}
                                                               onChange={e => setVirtualCab( {
                                                                   ...virtualCab,
                                                                   website: e.target.value
                                                               } )}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={{ size: 2, offset: 9 }} sm={{ size: 4, offset: 7 }}>
                                                    <FormGroup>
                                                        <Button color="primary float-right"
                                                                onClick={_updateContactVirtualCab}><i
                                                            className="fa fa-check"/> {label.common.save}</Button>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </TabPane>
                                    <Modal tabId="Extra Info" size="lg" isOpen={togglePopupVirtualCab}
                                           toggle={togglePopupVirtualCabi}>
                                        <div style={{ margin: '20px' }}>
                                            <Row>
                                                <Col md="6" sm={6}>
                                                    <Anchor affix={false} offsetTop="120">
                                                        <Link className="hvr-underline bull" href="#coutHoraire"
                                                              title={label.generalInfo.coutHoraire.label1}/>
                                                        <Link className="hvr-underline bull" href="#logo"
                                                              title={label.generalInfo.logo}/>
                                                        <Link className="hvr-underline bull" href="#notification"
                                                              title={label.generalInfo.notification}/>
                                                        <Link className="hvr-underline bull" href="#drive"
                                                              title={label.generalInfo.drive.label1}/>
                                                        <Link className="hvr-underline bull" href="#repertoire"
                                                              title={label.generalInfo.repertoire.label1}/>
                                                    </Anchor>
                                                </Col>
                                            </Row>
                                            <Form action="/" className="form-horizontal form-underline" method="get">
                                                <Row>
                                                    <Col md="5" sm={6}>
                                                        <Label
                                                            id="coutHoraire">{props.label.generalInfo.coutHoraire.label1}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><span
                                                                    className="currency-input-text">{currency}</span></InputGroupText>
                                                            </InputGroupAddon>
                                                            <Input style={{ margin: 'auto' }}
                                                                   placeholder={props.label.generalInfo.coutHoraire.placeholder}
                                                                   type="text"
                                                                   value={virtualCab.couthoraire}
                                                                   onChange={e => setVirtualCab( {
                                                                       ...virtualCab,
                                                                       couthoraire: e.target.value
                                                                   } )}/>
                                                        </InputGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={{ size: 2, offset: 9 }} sm={{ size: 4, offset: 7 }}>
                                                        <FormGroup>
                                                            <Button color="primary float-right"
                                                                    onClick={_updateHRateVirtualCab}><i
                                                                className="fa fa-check"/> {label.common.save}</Button>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Form>
                                            <Form action="/" className="form-horizontal form-underline" method="get">
                                                <Row>
                                                    <Col md="5" sm={6}>
                                                        <h3 id="logo">{props.label.generalInfo.logo}</h3>
                                                        <FormGroup>
                                                            <ImageUpload
                                                                saveFile={_uploadPicture}
                                                                avatar={virtualCab.logo}/>
                                                        </FormGroup>
                                                    </Col>

                                                </Row>
                                            </Form>

                                            <Form action="/" className="form-horizontal form-underline" method="get">
                                                <Row>
                                                    <Col md="5" sm={6}>
                                                        <h3 id="notification">{label.generalInfo.notification}</h3>
                                                        <FormGroup check>
                                                            <div>
                                                                <Label check>
                                                                    <Input
                                                                        checked={virtualCab.isNotification}
                                                                        type="checkbox"
                                                                        onChange={e => {
                                                                            setVirtualCab( {
                                                                                ...virtualCab,
                                                                                isNotification: e.target.checked
                                                                            } );
                                                                        }}
                                                                    />
                                                                    <span className={`form-check-sign`}>
                                                                        <span
                                                                            className="check"> {label.profile.notification}</span>
                                                                    </span>
                                                                </Label>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={{ size: 2, offset: 9 }} sm={{ size: 4, offset: 7 }}>
                                                        <FormGroup>
                                                            <Button color="primary float-right" disabled={isLoading}
                                                                    onClick={_updateVirtualCabNotification}><i
                                                                className="fa fa-check"/>
                                                                {isLoading ? (
                                                                    <Spinner
                                                                        size="sm"
                                                                        color="secondary"
                                                                    />
                                                                ) : null}
                                                                {label.common.save}
                                                            </Button>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Form>

                                            <Form action="/" className="form-horizontal form-underline" method="get">
                                                <Row>
                                                    <Col md="5" sm={6}>
                                                        <h3 id="drive">{props.label.generalInfo.drive.label1}</h3>
                                                        <FormGroup>
                                                            <div style={{ marginLeft: '2rem' }}>
                                                                <Label>
                                                                    <Input placeholder=".col-md-3" type="radio"
                                                                           name="whichDriveType" value="openstack"
                                                                           onChange={handleDriveChoice}
                                                                           checked={virtualCab.driveType === 'openstack'}/>
                                                                    {props.label.generalInfo.drive.ulegalize}
                                                                </Label>
                                                                <br/>
                                                                <Label>
                                                                    <Input placeholder=".col-md-3" type="radio"
                                                                           name="whichDriveType" value="dropbox"
                                                                           onChange={handleDriveChoice}
                                                                           checked={virtualCab.driveType === 'dropbox'}/>
                                                                    {props.label.generalInfo.drive.dropbox}
                                                                </Label>
                                                                <Button id="dropboxAuthButton" style={hideDBBtn}
                                                                        onClick={_associateDrive}
                                                                        className="btn btn-default">{label.generalInfo.label6}</Button>
                                                                <br/>
                                                                <Label>
                                                                    <Input placeholder=".col-md-3" type="radio"
                                                                           name="whichDriveType" value="onedrive"
                                                                           onChange={handleDriveChoice}
                                                                           checked={virtualCab.driveType === 'onedrive'}/>
                                                                    {props.label.generalInfo.drive.oneDrive}
                                                                </Label>
                                                                <Button id="onedriveAuthButton"
                                                                        onClick={_associateOneDrive}
                                                                        style={hideODBtn}
                                                                        className="btn btn-default">{label.generalInfo.label6}</Button>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={{ size: 2, offset: 9 }} sm={{ size: 4, offset: 7 }}>
                                                        <FormGroup>
                                                            <Button color="primary float-right"
                                                                    onClick={_updateDriveVirtualCab}><i
                                                                className="fa fa-check"/> {label.common.save}</Button>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Form>
                                            <Form action="/" className="form-horizontal" method="get">
                                                <Row>
                                                    <Col md="5" sm={6}>
                                                        <h3 id="repertoire">{props.label.generalInfo.repertoire.label1}</h3>
                                                        <FormGroup>
                                                            <Label
                                                                style={{ whiteSpace: 'nowrap' }}>{props.label.generalInfo.repertoire.label2}</Label>
                                                            <div>
                                                                <Tooltip
                                                                    title={props.label.generalInfo.repertoire.tooltip}>
                                                                    <Input style={{ margin: 'auto' }}
                                                                           placeholder={props.label.generalInfo.repertoire.placeholder}
                                                                           type="text"
                                                                           onKeyPress={handleCreateClassementItem}
                                                                           value={register}
                                                                           onChange={handleCabConfigChange}/>
                                                                </Tooltip>
                                                                <Button color="primary" onClick={handleSubmit}><i
                                                                    className="fas fa-plus"/> {label.common.add}
                                                                </Button>
                                                                <small
                                                                    style={{ whiteSpace: 'nowrap' }}>{props.label.generalInfo.repertoire.charAutorized}</small>
                                                            </div>
                                                        </FormGroup>

                                                        <small
                                                            style={{ whiteSpace: 'nowrap' }}>{props.label.generalInfo.repertoire.explication1}</small>
                                                        <br/>
                                                        <small
                                                            style={{ whiteSpace: 'nowrap' }}> {props.label.generalInfo.repertoire.explication2}</small>
                                                        <br/>
                                                        <small
                                                            style={{ whiteSpace: 'nowrap' }}>{props.label.generalInfo.repertoire.explication3}</small>


                                                        <br/>
                                                        <br/>
                                                        <div style={{
                                                            overflowY: 'scroll',
                                                            minHeight: '50px',
                                                            maxHeight: '150px',
                                                            border: '1px solid rgba(29, 37, 59, 0.5)',
                                                            borderRadius: '10px'
                                                        }}>
                                                            <ul>
                                                                {virtualCabConfigList.map( ( item, i ) => <Classement
                                                                    key={i} index={i} classement={item}
                                                                    removeClassement={removeClassement}/> )}
                                                            </ul>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                            <ModalFooter>
                                                <Button variant="secondary"
                                                        onClick={() => setTogglePopupVirtualCab( false )}><i
                                                    className="fa fa-time"/>{label.common.cancel}</Button>
                                            </ModalFooter>
                                        </div>

                                    </Modal>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}
