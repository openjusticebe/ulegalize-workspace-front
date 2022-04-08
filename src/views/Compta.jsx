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
} from 'reactstrap';
import classnames from 'classnames';
import ComptaDTO from '../model/compta/ComptaDTO';
import { createCompta, getAllInfo, getComptaById, getComptaDefault, updateCompta } from '../services/ComptaServices';
import { useAuth0 } from '@auth0/auth0-react';
import ItemDTO from '../model/ItemDTO';
import Select from 'react-select';
import CircularProgress from '@material-ui/core/CircularProgress';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getAffairesByVcUserIdAndSearchCriteria, getDossierById } from '../services/DossierService';
import { getInvoiceById, getInvoicesBySearchCriteria } from '../services/InvoiceService';
import { getOptionNotification } from '../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import ReactLoading from 'react-loading';
import { getClient, getClientById } from '../services/ClientService';
import DossierDTO from '../model/affaire/DossierDTO';
import InvoiceDTO from '../model/invoice/InvoiceDTO';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { RegisterClientModal } from '../components/client/RegisterClientModal';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const round = require( 'lodash/round' );

require( 'moment/locale/fr' );

export const Compta = ( props ) => {
    const {
        match: { params },
        location: { query },
        label,
        currency,
        vckeySelected,
        enumRights,
        history,
        userId,
        fullName,
        language,
        email
    } = props;

    const notificationAlert = useRef( null );

    const [loadingSave, setLoadingSave] = useState( false );
    const [focusPercent, setFocusPercent] = useState( false );
    const [focusGrid, setFocusGrid] = useState( false );
    const [focusttc, setFocusttc] = useState( false );
    const [focushtc, setFocushtc] = useState( false );
    const [data, setData] = useState( null );
    const [tiers, setTiers] = useState( [] );
    const [postes, setPostes] = useState( [] );
    const [types, setTypes] = useState( [] );
    const [defaultTva, setDefaultTva] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const [dataGrids, setDataGrid] = useState( [] );
    const isCreated = useRef( !isNil( params.comptaid ) ? false : true );
    const affaireid = useRef( !isNil( query ) && !isNil( query.affaireId ) ? query.affaireId : null );
    const isComeDebours = useRef( !isNil( query ) && !isNil( query.debours ) ? query.debours : null );
    const isComeFrais = useRef( !isNil( query ) && !isNil( query.frais ) ? query.frais : null );
    const isComeHonoraires = useRef( !isNil( query ) && !isNil( query.honoraires ) ? query.honoraires : null );
    const isComeTiers = useRef( !isNil( query ) && !isNil( query.tiers ) ? query.tiers : null );
    const [clientModal, setClientModal] = useState( null );
    const [openclientModal, setOpenclientModal] = useState( false );

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();

                await getAllInfo( accessToken, isComeDebours.current, isComeFrais.current, isComeHonoraires.current, isComeTiers.current,
                    async ( grids, tiers, postes, tva, types ) => {
                        let result;
                        if ( !isNil( params.comptaid ) ) {
                            result = await getComptaById( accessToken, params.comptaid );
                        } else {
                            result = await getComptaDefault( accessToken, params.comptaid );
                        }

                        let comptaDto;

                        if ( !isNil( result ) ) {
                            if ( !isNil( result.data ) && !isEmpty( result.data ) ) {
                                comptaDto = new ComptaDTO( result.data );
                            } else {
                                props.history.push( { pathname: `/auth/unauthorized/` } );
                            }
                        }

                        if ( !isNil( grids ) ) {
                            const itemDtos = map( grids, grid => {
                                return new ItemDTO( grid );
                            } );
                            setDataGrid( itemDtos );
                        }

                        let tiersData = map( tiers, tier => {
                            if ( comptaDto.idCompte === tier.value ) {
                                comptaDto.compte = new ItemDTO( tier );
                            }

                            return new ItemDTO( tier );
                        } );
                        // by default
                        if ( isNil( params.comptaid ) && !isNil( tiersData ) && !isEmpty( tiersData ) ) {
                            comptaDto.compte = new ItemDTO( tiersData[ 0 ] );
                            comptaDto.idCompte = tiersData[ 0 ].value;
                        }
                        setTiers( tiersData );
                        let typesData = map( types, type => {

                            if ( comptaDto.idType === type.value ) {
                                comptaDto.idTypeItem = new ItemDTO( type );
                            }
                            return new ItemDTO( type );
                        } );
                        setTypes( typesData );

                        let posteData = map( postes, poste => {
                            // if isdebour or isfrais the default poste is different
                            if ( isNil( isComeDebours.current ) && isNil( isComeFrais.current ) ) {
                                if ( comptaDto.idPost === poste.value ) {
                                    comptaDto.poste = new ItemDTO( poste );
                                }
                            }
                            return new ItemDTO( poste );
                        } );
                        // if isdebour or isfrais the default poste is different
                        if ( posteData && (!isNil( isComeDebours.current ) || !isNil( isComeFrais.current )) ) {
                            comptaDto.idPost = posteData[ 0 ].value;
                            comptaDto.poste = posteData[ 0 ];

                        }
                        setPostes( posteData );

                        if ( tva ) {
                            setDefaultTva( new ItemDTO( tva ) );
                        }

                        // get dossier because it's in the url
                        if ( !isNil( affaireid.current ) ) {
                            let resultDossier = await getDossierById( accessToken, affaireid.current, vckeySelected );
                            if ( !resultDossier.error && !isNil( resultDossier.data ) && !isEmpty( resultDossier.data ) ) {
                                const dossierDefault = new DossierDTO( resultDossier.data );

                                comptaDto.idDoss = dossierDefault.id;
                                comptaDto.idDossierItem = new ItemDTO( {
                                    value: dossierDefault.id,
                                    label: dossierDefault.fullnameDossier
                                } );
                            }
                        }

                        setData( comptaDto );

                    } );

            } catch ( e ) {
                // doesn't work
            }
        })();
    }, [getAccessTokenSilently] );
    if ( isNil( props.label.compta ) ) {
        return (
            <CircularProgress size={50}/>
        );
    }

    const _handleClientChange = ( newValue ) => {
        setData( { ...data, idUser: newValue ? newValue.value : null, idUserItem: newValue } );
    };

    const _loadClientOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getClient( accessToken, inputValue );

        callback( map( result.data, data => {
            return new ItemDTO( { value: data.id, label: data.fullName, isDefault: data.email } );
        } ) );
    };

    const _loadDossierOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getAffairesByVcUserIdAndSearchCriteria( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, dossier => {
                        return new ItemDTO( dossier );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    const _handleDossierChange = async ( newValue ) => {
        setData( {
            ...data,
            idDoss: newValue ? newValue.value : null,
            idDossierItem: newValue
        } );
    };

    const _loadFactureOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getInvoicesBySearchCriteria( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, facture => {
                        return new ItemDTO( facture );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    const _handleFactureChange = async ( newValue ) => {
        //const inputValue = newValue.replace( /\W/g, '' );
        const accessToken = await getAccessTokenSilently();

        if ( !isNil( newValue ) ) {
            const result = await getInvoiceById( accessToken, newValue.value, vckeySelected );

            if ( !isNil( result.data ) && !isEmpty( result.data ) ) {
                const invoiceSummary = new InvoiceDTO( result.data );
                setData( {
                    ...data,
                    idFacture: newValue.value,
                    idFactureItem: newValue,
                    idDoss: isNil( data.idDoss ) && !isNil( invoiceSummary.dossierItem ) ? invoiceSummary.dossierItem.value : data.idDoss,
                    idDossierItem: isNil( data.idDossierItem ) && !isNil( invoiceSummary.dossierItem ) ? invoiceSummary.dossierItem : data.idDossierItem,
                    idUser: isNil( data.idUser ) ? invoiceSummary.clientId : data.idUser,
                    idUserItem: isNil( data.idUserItem ) ? invoiceSummary.clientItem : data.idUserItem
                } );
            }
        } else {
            setData( {
                ...data,
                idFacture: null,
                idFactureItem: null,
            } );
        }

    };

    const _saveCompta = async () => {
        setLoadingSave( true );

        const accessToken = await getAccessTokenSilently();

        let result = await createCompta( accessToken, data );

        if ( !result.error ) {
            // Input
            if ( data.idType === 1 ) {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.compta.success2, 'primary' ) );
                // output
            } else if ( data.idType === 2 ) {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.compta.success5, 'primary' ) );
            }
        } else {
            if ( data.idType === 1 ) {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.compta.error2, 'danger' ) );
                // output
            } else if ( data.idType === 2 ) {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.compta.error1, 'danger' ) );
            }
        }
        setLoadingSave( false );
    };
    const _updateCompta = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        let result = await updateCompta( accessToken, data );

        if ( !result.error ) {
            if ( data.idType === 1 ) {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.compta.success1, 'primary' ) );
                // output
            } else if ( data.idType === 2 ) {
                notificationAlert.current.notificationAlert( getOptionNotification( props.label.compta.success4, 'primary' ) );
            }
        }
        setLoadingSave( false );
    };

    const _changeMontant = async ( e ) => {
        let cost = data.montantHt;

        //if(isNil(data.montantHt) || data.montantHt === 0) {
        cost = round( ((e.target.value) / (1 + (defaultTva.value / 100))) * 100 ) / 100;
        //}

        setData( {
            ...data,
            montant: e.target.value,
            montantHt: cost
        } );
    };
    const _clientUpdated = async ( clientId ) => {
        const accessToken = await getAccessTokenSilently();

        if ( !isNil( data.idUser ) || !isEmpty( data.idUser ) ) {
            let clientResult = await getClientById( accessToken, data.idUser );

            data.idUserItem = new ItemDTO(
                {
                    value: clientResult.data.id,
                    label: clientResult.data.fullName,
                    isDefault: clientResult.data.email
                } );
        }

        setData( { ...data } );
        setClientModal( null );
        setOpenclientModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPUpdate, 'primary' ) );
    };
    const _clientCreated = async ( client ) => {
        const accessToken = await getAccessTokenSilently();

        let clientResult = await getClientById( accessToken, client.id );

        data.idUser = client.id;
        data.idUserItem = new ItemDTO(
            {
                value: clientResult.data.id,
                label: clientResult.data.fullName,
                isDefault: clientResult.data.email
            } );

        setData( { ...data } );
        setClientModal( null );
        setOpenclientModal( false );
        notificationAlert.current.notificationAlert( getOptionNotification( label.ajout_client.toastrSuccessPInsert, 'primary' ) );
    };
    const _toggleClient = () => {
        setClientModal( null );
        setOpenclientModal( false );
    };
    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col md={9} sm={5}>
                        <Link className="btn btn-link btn-primary padding-left-25" to={`/admin/list/compta`}>
                            <i className="fas fa-arrow-left"/>{' '}{label.common.list}</Link>
                    </Col>
                    <Col className="margin-bottom-15" md={{ size: 3 }} sm={{ size: 7 }}>
                        <ButtonGroup>
                            {isCreated.current ? (
                                <Button color="primary" type="button" disabled={loadingSave}
                                        onClick={_saveCompta}
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
                                        onClick={_updateCompta}
                                >

                                    {label.common.update}
                                </Button>
                            )}
                            {(isCreated.current === false ? (
                                <Button color="danger" type="button">
                                    {label.common.delete}
                                </Button>
                            ) : null)}
                        </ButtonGroup>
                    </Col>
                </Row>
                <Card>
                    <CardHeader>
                        <Row>
                            <Col lg={9} md={9} sm={5}>{props.label.compta.journalEntry}</Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        {isNil( data ) ? (
                                <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                            ) :
                            (
                                <>
                                    <Row>
                                        <Col lg="3">
                                            <Label>{props.label.compta.type}</Label>
                                            <FormGroup>
                                                <Select
                                                    value={data.idTypeItem}
                                                    className="react-select info"
                                                    classNamePrefix="react-select"
                                                    name="singleSelect2"
                                                    onChange={value => setData( {
                                                        ...data,
                                                        idTypeItem: value,
                                                        idType: value.value
                                                    } )}
                                                    options={types}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col lg="5">
                                            <Label>{props.label.compta.account}</Label>
                                            <FormGroup>
                                                <Select
                                                    value={data.compte}
                                                    className="react-select info"
                                                    classNamePrefix="react-select"
                                                    name="singleSelect"
                                                    onChange={value => setData( {
                                                        ...data,
                                                        compte: value,
                                                        idCompte: value.value
                                                    } )}
                                                    options={tiers}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col lg="2">
                                            <Label>{props.label.compta.dateValue}</Label>
                                            <FormGroup>
                                                <Input
                                                    type="date"
                                                    value={data.dateValue}
                                                    onChange={( e ) => {
                                                        // new value e.target.value
                                                        setData( {
                                                            ...data,
                                                            dateValue: e.target.value
                                                        } );
                                                    }}
                                                    name="date"
                                                    id="exampleDate"
                                                    placeholder="date placeholder"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg="3">
                                            <Label>{props.label.compta.amountIncVAT}</Label>
                                            <InputGroup
                                                className={classnames( {
                                                    'input-group-focus': focusttc
                                                } )}
                                            >
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><span
                                                        className="currency-input-text">{currency}</span></InputGroupText>
                                                </InputGroupAddon>
                                                <Input
                                                    type="text"
                                                    value={data.montant}
                                                    onChange={( e ) => _changeMontant( e )}
                                                    placeholder="Montant TTC"
                                                    onFocus={e => setFocusttc( true )}
                                                    onBlur={e => setFocusttc( false )}
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col lg="3">
                                            <Label>{props.label.compta.amountExVAT}</Label>
                                            <InputGroup className={classnames( {
                                                'input-group-focus': focushtc
                                            } )}>
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><span
                                                        className="currency-input-text">{currency}</span></InputGroupText>
                                                </InputGroupAddon>
                                                <Input
                                                    type="text"
                                                    value={data.montantHt}
                                                    onChange={( e ) => {
                                                        // new value e.target.value
                                                        setData( {
                                                            ...data,
                                                            montantHt: e.target.value
                                                        } );
                                                    }}
                                                    placeholder="Montant HT"
                                                    onFocus={e => setFocushtc( true )}
                                                    onBlur={e => setFocushtc( false )}
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col lg="3">
                                            <Label>{props.label.compta.transactionType}</Label>
                                            <FormGroup>
                                                <Input type="select" name="select" id="exampleSelect">
                                                    <option>Virement</option>
                                                    <option>Carte de crédit</option>
                                                    <option>Espèce</option>
                                                    <option>Bancontact</option>
                                                    <option>Chèque</option>
                                                    <option>NA</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg="4">
                                            <Label>{props.label.compta.refPost}</Label>
                                            <FormGroup>
                                                <Select
                                                    value={data.poste}
                                                    className="react-select info"
                                                    classNamePrefix="react-select"
                                                    name="singleSelect"
                                                    onChange={value => setData( {
                                                        ...data,
                                                        poste: value,
                                                        idPost: value.value
                                                    } )}
                                                    options={postes}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col lg="4">
                                            <Label>{props.label.compta.customer}</Label>
                                            <FormGroup row>
                                                <Col lg="8">
                                                    <AsyncSelect
                                                        value={data.idUserItem}
                                                        className="react-select info"
                                                        classNamePrefix="react-select"
                                                        cacheOptions
                                                        isClearable={true}
                                                        loadOptions={_loadClientOptions}
                                                        defaultOptions
                                                        onChange={_handleClientChange}
                                                        placeholder={props.label.compta.customer}
                                                    />
                                                </Col>
                                                <Col md={3}>
                                                    {data.idUser ? (
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
                                                                setClientModal( data.idUser );
                                                                setOpenclientModal( !openclientModal );
                                                            }}
                                                        >
                                                            <i className="tim-icons icon-pencil"/>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            className="float-right"
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
                                                            <i className="tim-icons  icon-simple-add padding-icon-text"/> {label.common.create}
                                                        </Button>
                                                    )}
                                                </Col>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg="4">
                                            <Label>{data.idDossierItem ? (
                                                    <Link
                                                        to={`/admin/affaire/${data.idDossierItem.value}`}>{props.label.compta.file} {' '}
                                                        <VisibilityIcon/></Link>
                                                ) :
                                                props.label.compta.file}</Label>
                                            <FormGroup>
                                                <AsyncSelect
                                                    isClearable={true}
                                                    value={data.idDossierItem}
                                                    className="react-select info"
                                                    classNamePrefix="react-select"
                                                    cacheOptions
                                                    loadOptions={_loadDossierOptions}
                                                    defaultOptions
                                                    onChange={_handleDossierChange}
                                                    placeholder="numero dossier ou annee"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col lg="4">
                                            <Label>{data.idFactureItem ? (
                                                    <Link
                                                        to={`/admin/invoice/${data.idFactureItem.value}`}>{props.label.compta.bill} {' '}
                                                        <VisibilityIcon/></Link>
                                                ) :
                                                props.label.compta.bill}</Label>
                                            <FormGroup>
                                                <AsyncSelect
                                                    isClearable={true}
                                                    value={data.idFactureItem}
                                                    className="react-select info"
                                                    id="invoiceComptaId"
                                                    classNamePrefix="react-select"
                                                    cacheOptions
                                                    loadOptions={_loadFactureOptions}
                                                    defaultOptions
                                                    onChange={_handleFactureChange}
                                                    placeholder="numero facture ou annee"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg="6">
                                            <Label>{props.label.compta.note}</Label>
                                            <input type="text"
                                                   className="form-control"
                                                   id="inputNote"
                                                   value={data.memo}
                                                   onChange={( e ) => {
                                                       // new value e.target.value
                                                       setData( {
                                                           ...data,
                                                           memo: e.target.value
                                                       } );
                                                   }}
                                                   placeholder={props.label.compta.note}/>
                                        </Col>
                                    </Row>
                                </>
                            )
                        }
                    </CardBody>
                </Card>

            </div>
            {openclientModal ? (
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
            ) : null}

        </>
    );
};

export default Compta;