import React from 'react';
import { withAuth0 } from '@auth0/auth0-react';

// nodejs library that concatenates classes
import classNames from 'classnames';
// reactstrap components
import {
    Button,
    Collapse,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    InputGroup,
    Nav,
    Navbar,
    NavbarBrand,
    NavLink,
    Popover,
    PopoverBody,
    UncontrolledDropdown,
    UncontrolledTooltip
} from 'reactstrap';
import { Link } from 'react-router-dom';
import ModalCreateLawfirm from '../../views/popup/lawfirm/ModalCreateLawfirm';
import { getLawfirmList } from '../../services/LawfirmsService';
import { RegisterClientModal } from '../client/RegisterClientModal';
import PrestationChrono from './PrestationChrono';
import NotificationAlert from 'react-notification-alert';
import { openMeeting } from '../../services/JitsiService';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import { RegisterFraisModal } from '../Affaire/RegisterFraisModal';
import Voicerecord from './Voicerecord';
import ModalNoActivePayment from '../../views/affaire/popup/ModalNoActivePayment';
import { checkPaymentActivated } from '../../services/PaymentServices';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );

class AdminNavbar extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            deleteAlert: null,
            vcKeys: [],
            togglePopupCreatePrest: false,
            togglePopupCreateCab: false,
            togglePopupClient: false,
            chronoVisible: false,
            recordVisible: false,
            modalNotPaidSignDocument: false,
            collapseOpen: false,
            modalSearch: false,
            meetingLink: '',
            color: 'navbar-transparent'
        };
    }

    async componentDidMount() {
        window.addEventListener( 'resize', this.updateColor );
        const {
            userId,
        } = this.props;
        // fetch
        const { getAccessTokenSilently } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();

        const result = await getLawfirmList( accessToken, userId );

        if ( isNil( result.error ) || !result.error ) {
            this.setState( { vcKeys: result.data } );
        }

    }

    componentWillUnmount() {
        window.removeEventListener( 'resize', this.updateColor );
    }

    // function that adds color white/transparent to the navbar on resize (this is for the collapse)
    _showMessage = ( message, type ) => {
        let options = {};
        options = {
            place: 'tc',
            message: message,
            type: type,
            icon: 'tim-icons icon-bell-55',
            autoDismiss: 7
        };
        this.refs.notificationGeneralAlert.notificationAlert( options );
    };

    _toggleRecord = () => {
        this.setState( {
            recordVisible: !this.state.recordVisible
        } );
    };
    _toggleUnPaid = () => {
        this.setState( {
            modalNotPaidSignDocument: !this.state.modalNotPaidSignDocument
        } );
    };

    _refreshVckeys = async () => {
        const {
            userId,
        } = this.props;
        const { getAccessTokenSilently } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();

        const result = await getLawfirmList( accessToken, userId );

        if ( isNil( result.error ) || !result.error ) {
            this.setState( { vcKeys: result.data } );
        }
    };
    updateColor = () => {
        if ( window.innerWidth < 993 && this.state.collapseOpen ) {
            this.setState( {
                color: 'bg-white'
            } );
        } else {
            this.setState( {
                color: 'navbar-transparent'
            } );
        }
    };
    // this function opens and closes the collapse on small devices
    toggleCollapse = () => {
        if ( this.state.collapseOpen ) {
            this.setState( {
                color: 'navbar-transparent'
            } );
        } else {
            this.setState( {
                color: 'bg-white'
            } );
        }
        this.setState( {
            collapseOpen: !this.state.collapseOpen
        } );
    };
    // this function is to open the Search modal
    toggleModalSearch = () => {
        this.setState( {
            modalSearch: !this.state.modalSearch
        } );
    };
    // this function is to open the Search modal
    _openMeeting = async () => {
        const { getAccessTokenSilently } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();
        const resultLink = await openMeeting( accessToken );

        if ( !resultLink.error ) {
            window.open(
                resultLink.data,
                '_blank' // <- This is what makes it open in a new window.
            );
            //this.setState( {
            //    meetingLink: resultLink.data
            //} );
        }
    };
    // this function is to open the Search modal
    toggleChrono = () => {
        this.setState( {
            chronoVisible: !this.state.chronoVisible
        } );
    };
    // this function is to open the Search modal
    togglePopupCreatePrestation = ( e, message, type ) => {
        this.setState( {
            togglePopupCreatePrest: !this.state.togglePopupCreatePrest
        } );
        if ( message && type ) {
            this._showMessage( message, type );
        }
    };
    // this function is to open the Search modal
    togglePopupCreateCab = () => {
        this.setState( {
            togglePopupCreateCab: !this.state.togglePopupCreateCab
        } );
    };

    // this function is to open the Search modal
    togglePopupClient = () => {
        this.setState( {
            togglePopupClient: !this.state.togglePopupClient
        } );
    };
    _clientCreated = async () => {
        this.togglePopupClient();
        this.props.clientCreated();
    };

    render() {
        const {
            label,
            currency,
            history,
            vckeySelected,
            fullName,
            language,
            userEmail,
            enumRights,
            handleMiniClick,
            sidebarOpened,
            toggleSidebar,
            location
        } = this.props;
        const {
            logout
        } = this.props.auth0;

        const {
            togglePopupCreatePrest, togglePopupCreateCab,
            vcKeys,
            color,
            collapseOpen
        } = this.state;

        return (
            <>
                <div className="rna-container">
                    <NotificationAlert ref="notificationGeneralAlert"/>
                </div>
                <Navbar
                    className={classNames( 'navbar-absolute', {
                        [ color ]:
                        location.pathname.indexOf( 'full-screen-map' ) === -1
                    } )}
                    expand="lg"
                >
                    <Container fluid>
                        <div className="navbar-wrapper">
                            <div className="navbar-minimize d-inline">
                                <Button
                                    className="minimize-sidebar btn-just-icon"
                                    color="link"
                                    id="tooltip209599"
                                    onClick={handleMiniClick}
                                >
                                    <i className="tim-icons icon-align-center visible-on-sidebar-regular"/>
                                    <i className="tim-icons icon-bullet-list-67 visible-on-sidebar-mini"/>
                                </Button>
                                <UncontrolledTooltip
                                    delay={0}
                                    target="tooltip209599"
                                    placement="right"
                                >
                                    Sidebar toggle
                                </UncontrolledTooltip>
                            </div>
                            <div
                                className={classNames( 'navbar-toggle d-inline', {
                                    toggled: sidebarOpened
                                } )}
                            >
                                <button
                                    className="navbar-toggler"
                                    type="button"
                                    onClick={toggleSidebar}
                                >
                                    <span className="navbar-toggler-bar bar1"/>
                                    <span className="navbar-toggler-bar bar2"/>
                                    <span className="navbar-toggler-bar bar3"/>
                                </button>
                            </div>
                            <NavbarBrand href="#pablo" onClick={e => e.preventDefault()}>
                                {vckeySelected} {' / '}
                                <small className="text-muted">{userEmail}</small>
                            </NavbarBrand>
                        </div>
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-toggle="collapse"
                            data-target="#navigation"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                            onClick={this.toggleCollapse}
                        >
                            <span className="navbar-toggler-bar navbar-kebab"/>
                            <span className="navbar-toggler-bar navbar-kebab"/>
                            <span className="navbar-toggler-bar navbar-kebab"/>
                        </button>
                        <Collapse navbar isOpen={collapseOpen}>
                            <Nav className="ml-auto" navbar>
                                {/*<NavItem>*/}
                                {/*    <NavLink className="btn btn-primary"*/}
                                {/*             target="_blank"*/}
                                {/*             href="/components/"><p className="color-white">open meeting</p></NavLink>*/}
                                {/*</NavItem>*/}
                                <InputGroup tag="li">
                                    <UncontrolledDropdown group>
                                        <DropdownToggle caret color="primary" className="btn-round" id="headerLabelId1"
                                                        data-toggle="dropdown">
                                            <i className="fa fa-plus color-white padding-right-7"/> {label.header.label1}
                                            {/*<i className="tim-icons icon-simple-add" /> Créer*/}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem tag={Link}
                                                          to="/admin/create/affaire">{label.header.label2}</DropdownItem>
                                            <DropdownItem
                                                onClick={this.togglePopupCreatePrestation}>{label.header.label10}</DropdownItem>
                                            <DropdownItem tag={Link}
                                                          to="/admin/create/compta">{label.header.label3}</DropdownItem>
                                            <DropdownItem tag={Link}
                                                          to="/admin/create/invoice">{label.header.label4}</DropdownItem>
                                            <DropdownItem
                                                onClick={this.togglePopupClient}>{label.header.label5}</DropdownItem>
                                            <DropdownItem
                                                onClick={this.togglePopupCreateCab}>{label.header.label6}</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </InputGroup>
                                <InputGroup className="search-bar" tag="li">
                                    <Button
                                        id="Popover3"
                                        color="link"
                                        className="border-outline-primary"
                                        data-target="#showRecord"
                                        onClick={this._toggleRecord}
                                    >
                                        <i className="fas fa-microphone  padding-icon-text"/>
                                        Record
                                    </Button>
                                    <Popover
                                        placement="left"
                                        isOpen={this.state.recordVisible}
                                        target="Popover3"
                                        className="popover-lg popover-secondary"
                                    >
                                        <div className="popover-header">{label.record.title}
                                            <Button
                                                style={{ top: -10 }}
                                                onClick={this._toggleRecord}
                                                color="primary"
                                                className="btn btn-link btn-icon float-right">
                                                <i className="fa fa-times"/>
                                            </Button></div>

                                        <PopoverBody>
                                            <Voicerecord
                                                selectedEventProps={null}
                                                toggleUnPaid={this._toggleUnPaid}
                                                toggleRecord={this._toggleRecord}
                                                fullName={fullName}
                                                currency={currency}
                                                language={language}
                                                label={label}
                                                history={history}
                                                isCreated={true}
                                                userId={this.props.userId}
                                                vckeySelected={vckeySelected}
                                                showMessage={this._showMessage}/>
                                        </PopoverBody>
                                    </Popover>
                                </InputGroup>
                                <InputGroup className="search-bar" tag="li">
                                    <Button
                                        id="Popover2"
                                        color="link"
                                        data-target="#showMeeting"
                                        onClick={() => {
                                            this.setState( {
                                                deleteAlert: (
                                                    <ReactBSAlert
                                                        info
                                                        style={{ display: 'block', marginTop: '100px' }}
                                                        title={label.header.label11}
                                                        onConfirm={() => {
                                                            this._openMeeting();
                                                            this.setState( { deleteAlert: null } );
                                                        }}
                                                        onCancel={() => { this.setState( { deleteAlert: null } ); }}
                                                        confirmBtnBsStyle="success"
                                                        cancelBtnBsStyle="danger"
                                                        confirmBtnText={label.common.label2}
                                                        cancelBtnText={label.common.label3}
                                                        showCancel
                                                        btnSize=""
                                                    >
                                                    </ReactBSAlert>
                                                )
                                            } );

                                        }}
                                        className="border-outline-primary"
                                    >
                                        <i className="tim-icons icon-calendar-60 padding-icon-text"/>
                                        {label.header.label12}
                                    </Button>
                                </InputGroup>
                                <InputGroup tag="li">
                                    <Button
                                        id="Popover1"
                                        color="link"
                                        data-target="#showChrono"
                                        onClick={this.toggleChrono}
                                    >
                                        <i className="tim-icons icon-time-alarm"/>
                                        <span className="d-lg-none d-md-block">Chrono</span>
                                    </Button>
                                    <Popover
                                        placement="right"
                                        isOpen={this.state.chronoVisible}
                                        target="Popover1"
                                        className="popover-secondary"
                                    >
                                        <div className="popover-header">Chrono
                                            <Button
                                                style={{ top: -10 }}
                                                onClick={this.toggleChrono}
                                                color="primary"
                                                className="btn btn-link btn-icon float-right">
                                                <i className="fa fa-times"/>
                                            </Button></div>
                                        <PopoverBody>
                                            <PrestationChrono
                                                history={history}
                                                _savePrestationmessage={this.props._savePrestationmessage}
                                                label={label}
                                                currency={currency}
                                            />
                                        </PopoverBody>
                                    </Popover>
                                </InputGroup>
                                <UncontrolledDropdown nav>
                                    <DropdownToggle
                                        caret
                                        color="default"
                                        data-toggle="dropdown"
                                        nav
                                    >
                                        <div className="notification d-none d-lg-block d-xl-block"/>
                                        <i className="tim-icons icon-sound-wave"/>
                                        <p className="d-lg-none">{label.header.label9}</p>
                                    </DropdownToggle>
                                    <DropdownMenu className="dropdown-navbar" right tag="ul">
                                        <NavLink tag="li">
                                            <DropdownItem disabled={true} className="nav-item">

                                            </DropdownItem>
                                        </NavLink>
                                        <DropdownItem divider tag="li"/>
                                        {vcKeys ? map( vcKeys, lawfirm => {
                                            return (
                                                <NavLink key={lawfirm.vckey} tag="li">
                                                    <DropdownItem
                                                        onClick={() => this.props.switchLawfirm( lawfirm.vckey )}
                                                        className="nav-item">
                                                        {lawfirm.vckey}
                                                    </DropdownItem>
                                                </NavLink>
                                            );
                                        } ) : null}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                                <UncontrolledDropdown nav>
                                    <DropdownToggle
                                        caret
                                        color="default"
                                        data-toggle="dropdown"
                                        nav
                                        onClick={e => e.preventDefault()}
                                    >
                                        <b className="caret d-none d-lg-block d-xl-block"/>
                                        <i className="far fa-user"/>

                                        <p className="d-lg-none">{label.header.label8}</p>
                                    </DropdownToggle>
                                    <DropdownMenu className="dropdown-navbar" right tag="ul">
                                        <NavLink tag="li">
                                            <DropdownItem tag={Link}
                                                          to="/admin/profile">{label.header.label7}</DropdownItem>

                                        </NavLink>
                                        <DropdownItem divider tag="li"/>
                                        <NavLink tag="li">
                                            <DropdownItem
                                                onClick={() => {
                                                    logout( { returnTo: window.location.origin } );
                                                }}
                                                className="nav-item">{label.header.label8}</DropdownItem>
                                        </NavLink>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                                <li className="separator d-lg-none"/>
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>
                {togglePopupCreateCab ?
                    (
                        <ModalCreateLawfirm
                            refreshVckeys={this._refreshVckeys}
                            showMessage={this._showMessage}
                            history={history}
                            label={label}
                            toggle={this.togglePopupCreateCab}
                            openDialog={togglePopupCreateCab}/>
                    ) : null}
                {togglePopupCreatePrest ?
                    (
                        <RegisterFraisModal
                            isFrais={null}
                            history={history}
                            isCreated={true}
                            label={label}
                            currency={currency}
                            affaireId={null}
                            vckeySelected={vckeySelected}
                            fullName={fullName}
                            language={language}
                            clientUpdated={this.togglePopupCreatePrestation}
                            showMessagePopupFrais={this._showMessage}
                            toggleFraisModal={this.togglePopupCreatePrestation}
                            toggleClientFrais={this.togglePopupCreatePrestation}
                            modal={togglePopupCreatePrest}
                        />
                    ) : null}
                {this.state.togglePopupClient ?
                    (
                        <RegisterClientModal
                            isCreate={true}
                            userId={this.props.userId}
                            label={label}
                            idClient={null}
                            vckeySelected={vckeySelected}
                            fullName={fullName}
                            language={language}
                            clientCreated={this._clientCreated}
                            toggleClient={this.togglePopupClient}
                            modal={this.state.togglePopupClient}
                            emailUserConnected={userEmail}
                            enumRights={enumRights}
                            history={history}
                        />
                    ) : null}
                {this.state.deleteAlert}
                {/* POPUP PAYMENT NOT REGISTERED */}
                {this.state.modalNotPaidSignDocument ? (
                    <ModalNoActivePayment
                        label={label}
                        toggleModalDetails={this._toggleUnPaid}
                        modalDisplay={this.state.modalNotPaidSignDocument}/>
                ) : null}
            </>
        );
    }
}

export default withAuth0( AdminNavbar );
