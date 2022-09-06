import React from 'react';
import { Route, Switch } from 'react-router-dom';
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from 'perfect-scrollbar';
// react plugin for creating notifications over the dashboard
import NotificationAlert from 'react-notification-alert';
// core components
import AdminNavbar from 'components/Navbars/AdminNavbar.jsx';
import Footer from 'components/Footer/Footer.jsx';
import Sidebar from 'components/Sidebar/Sidebar.jsx';
import { withAuth0 } from '@auth0/auth0-react';

import routes from 'routes.js';

import { getUsers } from '../../services/UserServices';
import label from '../../data/label';
import { switchLawfirm } from '../../services/LawfirmsService';
import ProfileDTO from '../../model/user/ProfileDTO';
import Lock from '../../components/Lock';
import { getOptionInfoNotification, getOptionNotification } from '../../utils/AlertUtils';
import NotFound from '../../views/NotFound';
import NotAuthorized from '../../views/NotAuthorized';

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

var ps;

class Admin extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            profile: null,
            label: {},
            darkMode: false,
            activeColor: 'blue',
            sidebarMini: true,
            opacity: 0.5,
            sidebarOpened: false,
        };

    }

    async componentDidMount() {
        if ( navigator.platform.indexOf( 'Win' ) > -1 ) {
            document.documentElement.className += ' perfect-scrollbar-on';
            document.documentElement.classList.remove( 'perfect-scrollbar-off' );

            ps = new PerfectScrollbar(this.refs.mainPanel);

            let tables = document.querySelectorAll( '.table-responsive' );
            for ( let i = 0; i < tables.length; i++ ) {
                ps = new PerfectScrollbar( tables[ i ] );
            }
        }
        //document.body.classList.toggle( 'white-content' );

        window.addEventListener( 'scroll', this.showNavbarButton );
        const { getAccessTokenSilently, user, logout } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();
        const subdomain = window.location.host.split( '.' )[ 0 ];
        const subdomainStorage = localStorage.getItem('subdomain');

        if(subdomain !== subdomainStorage) {
            logout( { returnTo: window.location.origin } );
            return;
        }

        const result = await getUsers( accessToken );

        if ( isNil( result.error ) || !result.error ) {
            const profile = new ProfileDTO( result.data );
            const language = profile && profile.language ? result.data.language : 'fr';

            if(!isNil(profile) && profile.temporaryVc === true) {
                this.props.history.push( '/auth/newsignup' );
                return;
            }

            this.setState( {
                label: label[ language ],
                profile: profile
            } );
        } else {
            this.props.history.push( {
                pathname: `/auth/unauthorized/`, state: {
                    label: label.fr,
                    email: user.email,
                    message: 'Aucun cabinet virtul associé à votre utilisateur',
                    messageEn: 'No virtul cabinet associated with your user',
                    messageNl: 'Geen virtuele kast gekoppeld aan uw gebruiker'
                }
            } );

        }
    }

    componentWillUnmount() {
        if ( navigator.platform.indexOf( 'Win' ) > -1 ) {
            ps.destroy();
            document.documentElement.className += ' perfect-scrollbar-off';
            document.documentElement.classList.remove( 'perfect-scrollbar-on' );
        }
        window.removeEventListener( 'scroll', this.showNavbarButton );

    }

     componentDidUpdate( e ) {
        if ( e.location.pathname !== e.history.location.pathname ) {
            if ( navigator.platform.indexOf( 'Win' ) > -1 ) {
                let tables = document.querySelectorAll( '.table-responsive' );
                for ( let i = 0; i < tables.length; i++ ) {
                    ps = new PerfectScrollbar( tables[ i ] );
                }
            }
            document.documentElement.scrollTop = 0;
            document.scrollingElement.scrollTop = 0;

            this.refs.mainPanel.scrollTop = 0;

        }
    }

    _changeLanguage = (language) => {
        this.setState( {
            profile : {...this.state.profile, language: language},
            label: label[language]
        } );
    };
    handleActiveMode = () => {
        this.setState( {
            darkMode: !this.state.darkMode
        } );
        document.body.classList.toggle( 'white-content' );
    };
    showNavbarButton = () => {
        if (
            document.documentElement.scrollTop > 50 ||
            document.scrollingElement.scrollTop > 50 ||
            this.refs.mainPanel.scrollTop > 50
        ) {
            //this.setState( { opacity: 1 } );
        } else if (
            document.documentElement.scrollTop <= 50 ||
            document.scrollingElement.scrollTop <= 50 ||
            this.refs.mainPanel.scrollTop <= 50
        ) {
            //this.setState( { opacity: 0 } );
        }
    };
    getRoutes = routes => {
        return routes.map( ( prop, key ) => {
            if ( prop.collapse ) {
                return this.getRoutes( prop.views );
            }

            let rightsFound ;
            if(prop.right) {
                rightsFound = this.state.profile.enumRights.filter(element => prop.right.includes(element));
            }

            if ( prop.layout === '/admin' ) {
                return (
                    <Route
                        path={prop.layout + prop.path}
                        render={
                            ( props ) => {
                                if(!isEmpty(rightsFound) || isNil(rightsFound)) {
                                    return <prop.component
                                        enumRights={this.state.profile.enumRights}
                                        email={this.state.profile.email}
                                        currency={this.state.profile.symbolCurrency}
                                        auth0={this.props.auth0}
                                        refreshUserProfile={this.refreshUserProfile}
                                        vckeySelected={this.state.profile.vcKeySelected}
                                        userId={this.state.profile.userId}
                                        fullName={this.state.profile.fullName}
                                        language={this.state.profile.language}
                                        label={this.state.label}
                                        driveType={this.state.profile.driveType}

                                        {...props}
                                    />;
                                } else {
                                    return  <NotAuthorized
                                        messageProp={this.state.label.unauthorized.label9}
                                        emailProp={this.state.profile.email}
                                        label={this.state.label}

                                        {...props}
                                    />
                                }

                            }}
                        key={key}
                    />
                );
            } else {
                return null;
            }
        }, this );
    };
    getActiveRoute = routes => {
        let activeRoute = 'Workspace';
        for ( let i = 0; i < routes.length; i++ ) {
            if ( routes[ i ].collapse ) {
                let collapseActiveRoute = this.getActiveRoute( routes[ i ].views );
                if ( collapseActiveRoute !== activeRoute ) {
                    return collapseActiveRoute;
                }
            } else {
                if (
                    window.location.pathname.indexOf(
                        routes[ i ].layout + routes[ i ].path
                    ) !== -1
                ) {
                    return routes[ i ].name;
                }
            }
        }
        return activeRoute;
    };
    handleActiveClick = color => {
        this.setState( { activeColor: color } );
    };
    _savePrestationmessage = (message, type) => {
        this.refs.notificationGeneralAlert.notificationAlert( getOptionNotification( message , type)  );

    };
    _clientCreated = () => {
        this.refs.notificationGeneralAlert.notificationAlert( getOptionInfoNotification( this.state.label.ajout_client.toastrSuccessPUpdate ) );
    };
    handleMiniClick = () => {
        let notifyMessage = 'Sidebar mini ';
        if ( document.body.classList.contains( 'sidebar-mini' ) ) {
            this.setState( { sidebarMini: false } );
            notifyMessage += 'deactivated...';
        } else {
            this.setState( { sidebarMini: true } );
            notifyMessage += 'activated...';
        }
        let options = {};
        options = {
            place: 'tc',
            message: notifyMessage,
            type: 'primary',
            icon: 'tim-icons icon-bell-55',
            autoDismiss: 7
        };
        this.refs.notificationGeneralAlert.notificationAlert( options );
        document.body.classList.toggle( 'sidebar-mini' );
    };
    toggleSidebar = () => {
        this.setState( {
            sidebarOpened: !this.state.sidebarOpened
        } );
        document.documentElement.classList.toggle( 'nav-open' );
    };
    closeSidebar = () => {
        this.setState( {
            sidebarOpened: false
        } );
        document.documentElement.classList.remove( 'nav-open' );
    };
    switchLawfirm = async ( newVcKeySelected ) => {
        const { getAccessTokenSilently } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();

        const result = await switchLawfirm( accessToken, newVcKeySelected );

        if ( isNil( result.error ) || !result.error ) {
            this.setState( { profile: { ...this.state.profile, vckeySelected: result.data } } );

            this.props.history.push( '/' );
        }

    };
    refreshUserProfile = async ( ) => {
        const { getAccessTokenSilently } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();
        const result = await getUsers( accessToken );
        if ( isNil( result.error ) || !result.error ) {
            const profile = new ProfileDTO( result.data );

            // check if the driveType is different
            // to avoid multi set state
            if(this.state.profile.driveType !== profile.driveType) {
                this.setState( {
                    profile: profile
                } );
            }
        }

    };
    render() {
        if ( isNil( this.state.profile ) ) {
            return (
                <div
                    className="main-panel"
                    ref="mainPanel"
                >
                <Lock message="Waiting profile information"/>
                </div>
            );
        }
        const { user } = this.props.auth0;

        const root = routes(this.state.label);
        const clientFrom = !isNil(user[ process.env.REACT_APP_AUTH_RULES_URL + 'client' ]) ? user[ process.env.REACT_APP_AUTH_RULES_URL + 'client' ] : 'workspace';
        const logo = process.env.REACT_APP_LOGO + clientFrom + '.png';

        return (
            <div className="wrapper">
                <div
                    className="navbar-minimize-fixed"
                    style={{ opacity: this.state.opacity }}
                >
                    <button
                        className="minimize-sidebar btn btn-link btn-just-icon"
                        onClick={this.handleMiniClick}
                    >
                        <i className="tim-icons icon-align-center visible-on-sidebar-regular text-muted"/>
                        <i className="tim-icons icon-bullet-list-67 visible-on-sidebar-mini text-muted"/>
                    </button>
                </div>
                <Sidebar
                    {...this.props}
                    routes={root}
                    activeColor={this.state.activeColor}
                    logo={{
                        outterLink: '#',
                        text: "Workspace",
                        imgSrc: logo
                    }}
                    profile={this.state.profile}
                    closeSidebar={this.closeSidebar}
                />
                <div
                    className="main-panel"
                    ref="mainPanel"
                    data={this.state.activeColor}
                >
                    <AdminNavbar
                        {...this.props}
                        switchLawfirm={this.switchLawfirm}
                        vckeySelected={this.state.profile.vcKeySelected}
                        userId={this.state.profile.userId}
                        userEmail={this.state.profile.email}
                        enumRights={this.state.profile.enumRights}
                        label={this.state.label}
                        currency={this.state.profile.symbolCurrency}
                        handleMiniClick={this.handleMiniClick}
                        _savePrestationmessage={this._savePrestationmessage}
                        clientCreated={this._clientCreated}
                        brandText={this.getActiveRoute( root )}
                        sidebarOpened={this.state.sidebarOpened}
                        toggleSidebar={this.toggleSidebar}
                    />
                    <div className="rna-container">
                        <NotificationAlert ref="notificationGeneralAlert"/>
                    </div>
                    <Switch>
                        {this.getRoutes( root )}
                        <Route
                            render={
                                ( props ) => <NotFound
                                    email={this.state.profile.email}
                                    currency={this.state.profile.symbolCurrency}
                                    auth0={this.props.auth0}
                                    vckeySelected={this.state.profile.vcKeySelected}
                                    userId={this.state.profile.userId}
                                    fullName={this.state.profile.fullName}
                                    language={this.state.profile.language}
                                    label={this.state.label}

                                    {...props}
                                />}
                          />
                    </Switch>

                    {// we don't want the Footer to be rendered on full screen maps page
                        this.props.location.pathname.indexOf( 'full-screen-map' ) !==
                        -1 ? null : (
                            <Footer
                                language={this.state.profile.language}
                                changeLanguage={this._changeLanguage} fluid/>
                        )}
                </div>
            </div>
        );
    }
}

export default withAuth0( Admin );
