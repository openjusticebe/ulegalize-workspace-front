import React, { useEffect, useRef, useState } from 'react';

// reactstrap components
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Row,
    Spinner,
    UncontrolledTooltip
} from 'reactstrap';
import CircularProgress from '@material-ui/core/CircularProgress';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import Select, { components } from 'react-select';
import ReactDatetime from 'react-datetime';
import {
    createDossier,
    getDossierById,
    getDossierDefault,
    switchDossierDigital,
    updateDossier
} from '../../../services/DossierService';
import { useAuth0 } from '@auth0/auth0-react';
import { getClient, getClientById, getClientListByIds } from '../../../services/ClientService';
import ItemDTO from '../../../model/ItemDTO';
import DossierDTO from '../../../model/affaire/DossierDTO';
import * as classnames from 'classnames';
import { getDossierType, getMatieres, getUserResponsableList } from '../../../services/SearchService';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../../utils/AlertUtils';
import CaseCreationDTO from '../../../model/affaire/CaseCreationDTO';
import ContactSummary from '../../../model/client/ContactSummary';
import { RegisterClientModal } from '../../../components/client/RegisterClientModal';
import ReactLoading from 'react-loading';
import { createDossierTransparency } from '../../../services/transparency/CaseService';
import ModalCheckSessionDrive from '../../popup/drive/ModalCheckSessionDrive';

let moment = require( 'moment-timezone' );

moment.tz.setDefault( 'Europe/Brussels' );
const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const isEmpty = require( 'lodash/isEmpty' );

export const RegisterDossier = ( props ) => {
    const {
        match: { params },
        vckeySelected,
        fullName,
        language,
        userId,
        label,
        email,
        enumRights,
        history,
        driveType
    } = props;

    const notificationAlert = useRef( null );

    const [tempClientMediation, setTempClientMediation] = useState( null );
    const [loadingSave, setLoadingSave] = useState( false );
    const [currency, setCurrency] = useState( null );
    const [focusPercent, setFocusPercent] = useState( false );
    const [focusFee, setFocusFee] = useState( false );
    const [focus, setFocus] = useState( false );
    const [openclientModal, setOpenclientModal] = useState( false );
    const [openclientAdvModal, setOpenclientAdvModal] = useState( false );
    const [openclientConseilAdvModal, setOpenclientConseilAdvModal] = useState( false );
    const [dossier, setDossier] = useState( null );
    const [clientModal, setClientModal] = useState( null );
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const [matieresList, setMatieresList] = useState( [] );
    const [dossierTypeList, setDossierTypeList] = useState( [] );
    const [isCreated] = useState( !isNil( params.affaireid ) ? false : true );
    const [checkTokenDrive, setCheckTokenDrive] = useState( false );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => { setCurrency( props.currency );}, [props.currency] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let result;
            if ( !isNil( params.affaireid ) ) {
                result = await getDossierById( accessToken, params.affaireid, vckeySelected );
            } else {
                result = await getDossierDefault( accessToken, params.affaireid );
            }
            let doss;
            if ( !result.error && !isNil( result.data ) ) {
                doss = new DossierDTO( result.data );
            } else {
                props.history.push( { pathname: `/auth/unauthorized/` } );
            }

            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {

                if ( doss.idUserResponsible === data.value ) {
                    doss.userResponsible = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setUserResponsableList( profiles );

            let resultMatiere = await getMatieres( accessToken );
            let list = map( resultMatiere.data, data => {
                if ( doss.id_matiere_rubrique === data.value ) {
                    doss.matiere_rubrique = new ItemDTO( data );
                }

                return new ItemDTO( data );
            } );
            setMatieresList( list );

            let resultDossieType = await getDossierType( accessToken );
            let dossierType = map( resultDossieType.data, data => {
                return new ItemDTO( data );
            } );
            setDossierTypeList( dossierType );

            // set dossier
            setDossier( doss );
            if ( !isNil( driveType ) && driveType === 'dropbox' ) {
                setCheckTokenDrive( true );
            }
        })();
    }, [getAccessTokenSilently] );

    const isDossierTypeMediation = !isNil( dossier ) && dossier.type === 'MD';
    const isDossierTypeNotMediation = !isNil( dossier ) && dossier.type !== 'MD';

    const _togglePopupCheckSession = ( message, type ) => {
        if ( !isNil( message ) && !isNil( type ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
        setCheckTokenDrive( !checkTokenDrive );
    };

    const _loadClientOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getClient( accessToken, inputValue, vckeySelected );

        callback( map( result.data, data => {
            return new ItemDTO( { value: data.id, label: data.fullName, isDefault: data.email } );
        } ) );
    };
    const _saveDossier = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        // different than mediation
        if ( dossier.type !== 'MD' ) {
            if ( isNil( dossier.idClient ) ) {
                setLoadingSave( false );

                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error5, 'danger' ) );
                return;
            }
            if ( isNil( dossier.idAdverseClient ) ) {
                setLoadingSave( false );

                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error6, 'danger' ) );
                return;
            }
            if ( dossier.idClient === dossier.idAdverseClient ) {
                setLoadingSave( false );

                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error12, 'danger' ) );
                return;
            }
        } else {
            if ( isNil( dossier.clientList ) || dossier.clientList.length === 0 ) {
                setLoadingSave( false );

                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error19, 'danger' ) );
                return;
            }
        }

        if ( isNil( dossier.openDossier ) ) {
            setLoadingSave( false );

            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error7, 'danger' ) );
            return;
        }

        if ( isNil( dossier.id_matiere_rubrique ) ) {
            setLoadingSave( false );

            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error8, 'danger' ) );
            return;
        }
        if ( isNil( dossier.idUserResponsible ) ) {
            setLoadingSave( false );

            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error9, 'danger' ) );
            return;
        }

        // lawfirm
        let result = await createDossier( accessToken, dossier );

        if ( !result.error ) {
            let clientList = [];
            // create transparency only if client has an email
            let isTransparency = false;
            if ( dossier.type !== 'MD' ) {
                const clientResult = await getClientById( accessToken, dossier.idClient );
                if ( !clientResult.error ) {

                    const client = new ContactSummary( clientResult.data, label );

                    isTransparency = !isNil( client.email ) && client.email !== '';
                    clientList.push( client );
                } else {
                    props.history.push( { pathname: `/admin/affaire/${result.data.id}`, state: { isCreate: true } } );
                }
            } else {
                const clientIds = map( dossier.clientList, clientTmp => clientTmp.value );
                const clientResult = await getClientListByIds( accessToken, clientIds );

                if ( !clientResult.error ) {
                    clientList = map( clientResult.data, data => {
                        // if one of them is valid
                        isTransparency = !isNil( data.email ) && data.email !== '';
                        return new ContactSummary( data, label );
                    } );

                } else {
                    props.history.push( { pathname: `/admin/affaire/${result.data.id}`, state: { isCreate: true } } );
                }
            }
            // create transparency only if client has an email
            if ( isTransparency ) {
                const newDossier = new DossierDTO( result.data );
                const caseCreation = new CaseCreationDTO( newDossier, clientList );
                let resultTransparency = await createDossierTransparency( accessToken, caseCreation );

                // no error
                if ( !resultTransparency.error ) {
                    switchDossierDigital( accessToken, newDossier.id );
                    props.history.push( {
                        pathname: `/admin/affaire/${result.data.id}`,
                        state: { isCreate: true }
                    } );
                } else {
                    props.history.push( {
                        pathname: `/admin/affaire/${result.data.id}`,
                        state: { isCreate: true }
                    } );
                }
            } else {
                props.history.push( { pathname: `/admin/affaire/${result.data.id}`, state: { isCreate: true } } );
            }

        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error10, 'danger' ) );
        }

        setLoadingSave( false );

    };
    const _updateDossier = async () => {
        setLoadingSave( true );

        const accessToken = await getAccessTokenSilently();

        let result = await updateDossier( accessToken, dossier );

        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.success5, 'primary' ) );
        }
        setLoadingSave( false );

    };
    const _handleClientChange = ( newValue ) => {
        //const inputValue = newValue.replace( /\W/g, '' );

        setDossier( { ...dossier, idClient: newValue.value, client: newValue } );

        //return inputValue;
    };
    const _handleClientAdvChange = ( newValue ) => {
        //const inputValue = newValue.replace( /\W/g, '' );

        setDossier( { ...dossier, idAdverseClient: newValue.value, adverseClient: newValue } );

        //return inputValue;
    };
    const _handleClientConseilAdvChange = ( newValue ) => {
        //const inputValue = newValue.replace( /\W/g, '' );

        setDossier( { ...dossier, conseilIdAdverseClient: newValue.value, conseilAdverseClient: newValue } );

        //return inputValue;
    };
    if ( isNil( label.affaire ) ) {
        return (
            <CircularProgress size={50}/>
        );
    }
    let title = `${label.affaire.label1} `;
    if ( !isCreated ) {
        title = `${label.affaire.label2} ${label.affaire.dossier_ref} `;
    }

    const _clientUpdated = async ( clientId ) => {
        const accessToken = await getAccessTokenSilently();

        if ( isDossierTypeNotMediation ) {
            if ( !isNil( dossier.idClient ) || !isEmpty( dossier.idClient ) ) {
                let clientResult = await getClientById( accessToken, dossier.idClient );

                dossier.client = new ItemDTO(
                    {
                        value: clientResult.data.id,
                        label: clientResult.data.fullName,
                        isDefault: clientResult.data.email
                    } );
            } else if ( !isNil( dossier.idAdverseClient ) || !isEmpty( dossier.idAdverseClient ) ) {
                let clientResult = await getClientById( accessToken, dossier.idAdverseClient );

                dossier.adverseClient = new ItemDTO(
                    {
                        value: clientResult.data.id,
                        label: clientResult.data.fullName,
                        isDefault: clientResult.data.email
                    } );
            }
        } else if ( isDossierTypeMediation ) {
            for ( let i = 0; i < dossier.clientList.length; i++ ) {
                let client = dossier.clientList[ i ];
                if ( client.value === clientId ) {
                    let clientResult = await getClientById( accessToken, client.value );

                    dossier.clientList[ i ] = new ItemDTO(
                        {
                            value: clientResult.data.id,
                            label: clientResult.data.fullName,
                            isDefault: clientResult.data.email
                        } );
                }
            }

        }

        setDossier( { ...dossier } );
        setClientModal( null );
        setOpenclientModal( false );
        setOpenclientAdvModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPUpdate, 'primary' ) );
    };
    const _clientCreated = async ( client ) => {
        const accessToken = await getAccessTokenSilently();

        let clientResult = await getClientById( accessToken, client.id );

        dossier.idClient = client.id;
        dossier.client = new ItemDTO(
            {
                value: clientResult.data.id,
                label: clientResult.data.fullName,
                isDefault: clientResult.data.email
            } );

        setDossier( dossier );
        setClientModal( null );
        setOpenclientModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPInsert, 'primary' ) );
    };
    const _clientAdvCreated = async ( client ) => {
        const accessToken = await getAccessTokenSilently();
        let clientResult = await getClientById( accessToken, client.id );

        dossier.idAdverseClient = client.id;

        dossier.adverseClient = new ItemDTO(
            {
                value: clientResult.data.id,
                label: clientResult.data.fullName,
                isDefault: clientResult.data.email
            } );

        setDossier( dossier );
        setClientModal( null );
        setOpenclientAdvModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPInsert, 'primary' ) );
    };
    const _clientConseilAdvCreated = async ( idClient ) => {
        const accessToken = await getAccessTokenSilently();
        let clientResult = await getClientById( accessToken, idClient.id );

        dossier.conseilIdAdverseClient = idClient.id;

        dossier.conseilAdverseClient = new ItemDTO(
            {
                value: clientResult.data.id,
                label: clientResult.data.fullName,
                isDefault: clientResult.data.email
            } );

        setDossier( dossier );
        setClientModal( null );
        setOpenclientConseilAdvModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPInsert, 'primary' ) );
    };
    const _toggleClient = () => {
        setClientModal( null );
        setOpenclientModal( false );
        setOpenclientAdvModal( false );
        setOpenclientConseilAdvModal( false );
    };
    const { Option, SingleValue } = components;

    const CustomSelectOption = props => (
        <Option {...props}>
            {props.data.label} {' '}
            {isNil( props.data.isDefault ) || isEmpty( props.data.isDefault ) ? (
                <>
                    <i data-placement="right"
                       id={'Tooltip-' + props.data.value}
                       className={`fa fa-exclamation-triangle yellow`}/>
                    <UncontrolledTooltip
                        delay={0}
                        placement="bottom"
                        target={'Tooltip-' + props.data.value}
                    >
                        No email
                    </UncontrolledTooltip>
                </>
            ) : null}
        </Option>
    );
    const CustomSelectValue = props => (
        <SingleValue {...props}>
            {props.data.label} {' '}
            {isNil( props.data.isDefault ) || isEmpty( props.data.isDefault ) ? (
                <>
                    <i data-placement="right"
                       id="tooltip811118934"
                       className={`fa fa-exclamation-triangle yellow`}/>
                    <UncontrolledTooltip
                        delay={0}
                        placement="bottom"
                        target="tooltip811118934"
                    >
                        No email
                    </UncontrolledTooltip>
                </>) : null}
        </SingleValue>
    );

    // Lawfirm
    let parties = isDossierTypeNotMediation ? (
        <>
            <Col md="4">
                <Label>{label.affaire.txtcc.title}</Label>
                <FormGroup row>
                    <Col md="10">
                        <AsyncSelect
                            value={dossier.client}
                            className="react-select info"
                            classNamePrefix="react-select"
                            placeholder={label.common.label14}
                            cacheOptions
                            loadOptions={_loadClientOptions}
                            defaultOptions
                            onChange={_handleClientChange}
                            components={{
                                Option: CustomSelectOption,
                                SingleValue: CustomSelectValue
                            }}

                        />
                    </Col>
                    <Col md="2">
                        {dossier.idClient ? (
                            <Button
                                className="btn-icon float-right"
                                color="primary"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    // write client
                                    const right = [0, 22];

                                    let rightsFound;
                                    if ( enumRights ) {
                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                    }
                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                        return;
                                    }
                                    setClientModal( dossier.idClient );
                                    setOpenclientModal( !openclientModal );
                                }}
                            >
                                <i className="tim-icons icon-pencil"/>
                            </Button>
                        ) : (
                            <Button
                                className="btn-icon float-right"
                                color="primary"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    // write client
                                    const right = [0, 22];

                                    let rightsFound;
                                    if ( enumRights ) {
                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                    }
                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                        return;
                                    }
                                    setClientModal( null );
                                    setOpenclientModal( !openclientModal );
                                }}
                            >
                                <i className="tim-icons icon-simple-add"/>
                            </Button>
                        )}

                    </Col>
                </FormGroup>
            </Col>
            <Col md="4">
                <Label>{label.affaire.txtca.title}</Label>
                <FormGroup row>
                    <Col md="10">
                        <AsyncSelect
                            value={dossier.adverseClient}
                            className="react-select info"
                            classNamePrefix="react-select"
                            placeholder={label.common.label14}
                            cacheOptions
                            loadOptions={_loadClientOptions}
                            defaultOptions
                            onChange={_handleClientAdvChange}
                        />
                    </Col>
                    <Col md="2">
                        {dossier.adverseClient ? (
                            <Button
                                className="btn-icon float-right"
                                color="primary"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    // write client
                                    const right = [0, 22];

                                    let rightsFound;
                                    if ( enumRights ) {
                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                    }
                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                        return;
                                    }
                                    setClientModal( dossier.idAdverseClient );
                                    setOpenclientAdvModal( !openclientAdvModal );
                                }}
                            >
                                <i className="tim-icons icon-pencil"/>
                            </Button>
                        ) : (
                            <Button
                                className="btn-icon float-right"
                                color="primary"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    // write client
                                    const right = [0, 22];

                                    let rightsFound;
                                    if ( enumRights ) {
                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                    }
                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                        return;
                                    }
                                    setClientModal( null );
                                    setOpenclientAdvModal( !openclientAdvModal );
                                }}
                            >
                                <i className="tim-icons icon-simple-add"/>
                            </Button>
                        )}
                    </Col>
                </FormGroup>
            </Col>
        </>
    ) : null;

    // Mediation
    if ( isDossierTypeMediation ) {
        parties = (
            <>
                <Col md="4">
                    <Label>{label.affaire.party.add}</Label>
                    <FormGroup row>
                        <Col md="10">
                            <AsyncSelect
                                value={tempClientMediation}
                                className="react-select info"
                                classNamePrefix="react-select"
                                placeholder={label.common.label14}
                                cacheOptions
                                loadOptions={_loadClientOptions}
                                defaultOptions
                                onChange={( newValue ) => {
                                    newValue.type = 'PARTY';
                                    setTempClientMediation( newValue );
                                }}
                                components={{
                                    Option: CustomSelectOption,
                                    SingleValue: CustomSelectValue
                                }}

                            />
                        </Col>
                        <Col md="2">
                            <Button
                                className="btn-icon float-right"
                                color="primary"
                                type="button"
                                size="sm"
                                disabled={isNil( tempClientMediation )}
                                onClick={() => {
                                    setDossier( {
                                        ...dossier,
                                        clientList: [...dossier.clientList, tempClientMediation]
                                    } );
                                    setTempClientMediation( null );
                                }}
                            >
                                <i className="tim-icons icon-simple-add"/>
                            </Button>
                        </Col>
                    </FormGroup>
                </Col>
            </>
        );
    }
    let nbParties = 1;

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Card>
                    <CardHeader>
                        <Row>
                            <Col lg={9} md={9} sm={5}>{isCreated ? title : title}</Col>
                            <Col lg={{ size: 2 }} md={{ size: 2 }} sm={{ size: 5 }}>
                                <ButtonGroup>
                                    {isCreated ? (
                                        <Button color="primary" type="button" disabled={loadingSave}
                                                onClick={_saveDossier}
                                        >
                                            {loadingSave ? (
                                                <Spinner
                                                    size="sm"
                                                    color="secondary"
                                                />
                                            ) : null}
                                            {' '} {label.common.save}
                                        </Button>
                                    ) : (
                                        <Button color="primary" type="button" disabled={loadingSave}
                                                onClick={_updateDossier}
                                        >

                                            {label.common.update}
                                        </Button>
                                    )}
                                </ButtonGroup>
                            </Col>
                        </Row>


                    </CardHeader>
                    <CardBody>
                        {isNil( dossier ) ? (
                                <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                            ) :
                            (
                                <>
                                    <Row>
                                        {parties}
                                        <Col md="4">
                                            <Label>{label.affaire.selDossType}</Label>
                                            <FormGroup>
                                                <Select
                                                    className="react-select info"
                                                    classNamePrefix="react-select"
                                                    placeholder={label.common.label14}
                                                    name="singleSelect"
                                                    value={dossier.typeItem}
                                                    onChange={value => setDossier( {
                                                        ...dossier,
                                                        type: value.value,
                                                        typeItem: value
                                                    } )
                                                    }
                                                    options={dossierTypeList}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {isDossierTypeMediation ?
                                        map( dossier.clientList, client => {
                                            return (
                                                <Row>
                                                    <Col md="4">
                                                        <Label>{label.affaire.party.title} {nbParties++}</Label>
                                                        <FormGroup row>
                                                            <Col md="10">
                                                                <AsyncSelect
                                                                    isDisabled={true}
                                                                    value={client}
                                                                    className="react-select info"
                                                                    classNamePrefix="react-select"
                                                                    placeholder={label.common.label14}
                                                                    cacheOptions
                                                                    loadOptions={_loadClientOptions}
                                                                    defaultOptions
                                                                    components={{
                                                                        Option: CustomSelectOption,
                                                                        SingleValue: CustomSelectValue
                                                                    }}

                                                                />
                                                            </Col>
                                                            <Col md="1">
                                                                {client.value ? (
                                                                    <Button
                                                                        className="btn-icon float-right"
                                                                        color="primary"
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            // write client
                                                                            const right = [0, 22];

                                                                            let rightsFound;
                                                                            if ( enumRights ) {
                                                                                rightsFound = enumRights.filter( element => right.includes( element ) );
                                                                            }
                                                                            if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                                                                notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                                                                return;
                                                                            }
                                                                            setClientModal( client.value );
                                                                            setOpenclientModal( !openclientModal );
                                                                        }}
                                                                    >
                                                                        <i className="tim-icons icon-pencil"/>
                                                                    </Button>
                                                                ) : null}

                                                            </Col>
                                                            {/* DELETE CLIENT FROM LIST */}
                                                            <Col md="1">
                                                                {client.value ? (
                                                                    <Button
                                                                        className="btn-icon float-right"
                                                                        color="primary"
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            let tempList = dossier.clientList.filter( clientTmp => clientTmp.value !== client.value );
                                                                            setDossier( {
                                                                                ...dossier,
                                                                                clientList: [...tempList]
                                                                            } );
                                                                        }}
                                                                    >
                                                                        <i className="tim-icons icon-trash-simple"/>
                                                                    </Button>
                                                                ) : null}

                                                            </Col>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            );
                                        } )
                                        : null
                                    }
                                    <Row>

                                        <Col md="4">
                                            <Label>{label.affaire.lblOpenDate}</Label>
                                            <FormGroup>
                                                <ReactDatetime
                                                    value={dossier.openDossier}
                                                    dateFormat="YYYY-MM-DD"
                                                    inputProps={{
                                                        className: 'form-control',
                                                        placeholder: 'Date Picker Here'
                                                    }}
                                                    onChange={value => {
                                                        setDossier( { ...dossier, openDossier: value } );
                                                    }}
                                                    timeFormat={false}
                                                />
                                            </FormGroup>
                                        </Col>

                                        <Col md="4">
                                            <Label>{label.affaire.lblCloseDate}</Label>
                                            <FormGroup>
                                                <ReactDatetime
                                                    value={dossier.closeDossier}
                                                    inputProps={{
                                                        className: 'form-control',
                                                        placeholder: 'Date Picker Here'
                                                    }}
                                                    onChange={value => setDossier( {
                                                        ...dossier,
                                                        closeDossier: value
                                                    } )}

                                                    timeFormat={false}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Label>{label.affaire.lblRespDoss}</Label>
                                            <FormGroup>
                                                <Select
                                                    value={dossier.userResponsible}
                                                    className="react-select info"
                                                    classNamePrefix="react-select"
                                                    placeholder={label.common.label14}
                                                    name="singleSelect"
                                                    onChange={value => setDossier( {
                                                        ...dossier,
                                                        userResponsible: value,
                                                        idUserResponsible: value.value
                                                    } )}
                                                    options={userResponsableList}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="4">
                                            <Label>{label.affaire.lblCost}</Label>
                                            <InputGroup className={classnames( {
                                                'input-group-focus': focus
                                            } )}>
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><span
                                                        className="currency-input-text">{currency}</span></InputGroupText>
                                                </InputGroupAddon>
                                                <Input step=".01"
                                                       value={dossier.couthoraire}
                                                       type="number"
                                                       onChange={event => {
                                                           setDossier( {
                                                               ...dossier,
                                                               couthoraire: event.target.value
                                                           } );
                                                       }}
                                                       id="inputCosthour"
                                                       placeholder={label.affaire.lblCost}
                                                       onFocus={e => setFocus( true )}
                                                       onBlur={e => setFocus( false )}
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col md="4">
                                            <Label>{label.affaire.lblSuccessFeePerc}</Label>
                                            <InputGroup className={classnames( {
                                                'input-group-focus': focusPercent
                                            } )}>
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><i className="fa fa-percent"></i></InputGroupText>
                                                </InputGroupAddon>
                                                <Input value={dossier.success_fee_perc}
                                                       type="number"
                                                       onChange={event => setDossier( {
                                                           ...dossier,
                                                           success_fee_perc: event.target.value
                                                       } )}
                                                       id="inputMontantPerc"
                                                       placeholder={label.affaire.lblSuccessFeePerc}
                                                       onFocus={e => setFocusPercent( true )}
                                                       onBlur={e => setFocusPercent( false )}
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col md="4">
                                            <Label>{label.affaire.lblSuccessFee}</Label>
                                            <InputGroup className={classnames( {
                                                'input-group-focus': focusFee
                                            } )}>
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><span
                                                        className="currency-input-text">{currency}</span></InputGroupText>
                                                </InputGroupAddon>
                                                <Input value={dossier.success_fee_montant}
                                                       type="number"
                                                       onChange={event => setDossier( {
                                                           ...dossier,
                                                           success_fee_montant: event.target.value
                                                       } )}
                                                       onFocus={e => setFocusFee( true )}
                                                       onBlur={e => setFocusFee( false )}
                                                       id="inputMontantht" placeholder={label.affaire.lblSuccessFee}
                                                />
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Label>{label.affaire.lblMat}</Label>
                                            <FormGroup>
                                                <Select
                                                    value={dossier.matiere_rubrique}
                                                    className="react-select info"
                                                    placeholder={label.common.label14}
                                                    classNamePrefix="react-select"
                                                    name="singleSelect"
                                                    onChange={value => setDossier( {
                                                        ...dossier,
                                                        matiere_rubrique: value,
                                                        id_matiere_rubrique: value.value
                                                    } )}

                                                    options={matieresList}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        {isDossierTypeNotMediation ? (
                                            <Col md="5">
                                                <Label>{label.affaire.lbladverseAdvice}</Label>
                                                <FormGroup row>
                                                    <Col md="10">
                                                        <AsyncSelect
                                                            value={dossier.conseilAdverseClient}
                                                            placeholder={label.common.label14}
                                                            className="react-select info"
                                                            classNamePrefix="react-select"
                                                            cacheOptions
                                                            loadOptions={_loadClientOptions}
                                                            defaultOptions
                                                            onChange={_handleClientConseilAdvChange}
                                                        />
                                                    </Col>
                                                    <Col md="2">
                                                        {dossier.conseilIdAdverseClient ? (
                                                            <Button
                                                                className="btn-icon float-right"
                                                                color="primary"
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // write client
                                                                    const right = [0, 22];

                                                                    let rightsFound;
                                                                    if ( enumRights ) {
                                                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                                                    }
                                                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                                                        return;
                                                                    }
                                                                    setClientModal( dossier.conseilAdverseClient );
                                                                    setOpenclientConseilAdvModal( !openclientConseilAdvModal );
                                                                }}
                                                            >
                                                                <i className="tim-icons icon-pencil"/>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                className="btn-icon float-right"
                                                                color="primary"
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // write client
                                                                    const right = [0, 22];

                                                                    let rightsFound;
                                                                    if ( enumRights ) {
                                                                        rightsFound = enumRights.filter( element => right.includes( element ) );
                                                                    }
                                                                    if ( !isNil( rightsFound ) && isEmpty( rightsFound ) ) {
                                                                        notificationAlert.current.notificationAlert( getOptionNotification( label.unauthorized.label9, 'danger' ) );
                                                                        return;
                                                                    }
                                                                    setClientModal( null );
                                                                    setOpenclientConseilAdvModal( !openclientConseilAdvModal );
                                                                }}
                                                            >
                                                                <i className="tim-icons icon-simple-add"/>
                                                            </Button>
                                                        )}
                                                    </Col>
                                                </FormGroup>
                                            </Col>
                                        ) : null}

                                        <Col md="5">
                                            <Label>{label.affaire.lblQuality}</Label>
                                            <FormGroup>
                                                <Input
                                                    type="textarea"
                                                    value={dossier.quality}
                                                    onChange={e => setDossier( {
                                                        ...dossier,
                                                        quality: e.target.value
                                                    } )}

                                                    placeholder={label.affaire.lblQuality}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="2">
                                            <Label>{label.affaire.lblMot}</Label>
                                            <FormGroup>
                                                <Input
                                                    type="text"
                                                    value={dossier.keywords}
                                                    onChange={e => setDossier( {
                                                        ...dossier,
                                                        keywords: e.target.value
                                                    } )}

                                                    placeholder={label.affaire.lblMot}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Label>{label.affaire.lblGest}</Label>
                                            <FormGroup>
                                                <Input
                                                    type="textarea"
                                                    value={dossier.note}
                                                    onChange={e => setDossier( { ...dossier, note: e.target.value } )}

                                                    placeholder={label.affaire.lblGest}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <Label>{label.affaire.lblUser}</Label>
                                            <FormGroup>
                                                <Input
                                                    type="textarea"
                                                    value={dossier.memo}
                                                    onChange={e => setDossier( { ...dossier, memo: e.target.value } )}

                                                    placeholder={label.affaire.lblUser}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <RegisterClientModal
                                        isCreate={isNil( clientModal )}
                                        userId={userId}
                                        label={label}
                                        history={history}
                                        idClient={clientModal}
                                        vckeySelected={vckeySelected}
                                        fullName={fullName}
                                        language={language}
                                        clientUpdated={_clientUpdated}
                                        clientCreated={_clientCreated}
                                        toggleClient={_toggleClient}
                                        modal={openclientModal}
                                        emailUserConnected={email}
                                        enumRights={enumRights}
                                    />
                                    <RegisterClientModal
                                        isCreate={isNil( clientModal )}
                                        userId={userId}
                                        history={history}
                                        label={label}
                                        idClient={clientModal}
                                        vckeySelected={vckeySelected}
                                        fullName={fullName}
                                        language={language}
                                        clientUpdated={_clientUpdated}
                                        clientCreated={_clientAdvCreated}
                                        toggleClient={_toggleClient}
                                        modal={openclientAdvModal}
                                        emailUserConnected={email}
                                        enumRights={enumRights}
                                    />
                                    <RegisterClientModal
                                        isCreate={isNil( clientModal )}
                                        userId={userId}
                                        history={history}
                                        label={label}
                                        idClient={clientModal}
                                        vckeySelected={vckeySelected}
                                        fullName={fullName}
                                        language={language}
                                        clientUpdated={_clientUpdated}
                                        clientCreated={_clientConseilAdvCreated}
                                        toggleClient={_toggleClient}
                                        modal={openclientConseilAdvModal}
                                        emailUserConnected={email}
                                        enumRights={enumRights}
                                    />

                                    {checkTokenDrive ?
                                        (
                                            <ModalCheckSessionDrive
                                                label={label}
                                                toggle={_togglePopupCheckSession}
                                                checkTokenDrive={checkTokenDrive}/>
                                        ) : null}
                                </>
                            )
                        }
                    </CardBody>
                </Card>


            </div>
        </>
    );
};
export default RegisterDossier;
