import React from 'react';
import { Route, Switch } from 'react-router-dom';
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from 'perfect-scrollbar';
// react plugin for creating notifications over the dashboard
import NotificationAlert from 'react-notification-alert';
// core components
import Footer from 'components/Footer/Footer.jsx';
import { withAuth0 } from '@auth0/auth0-react';

import routes from 'routes.js';

import { getLightUsers } from '../../services/UserServices';
import label from '../../data/label';
import { switchLawfirm } from '../../services/LawfirmsService';
import AuthNavbar from '../../components/Navbars/AuthNavbar';
import Lock from '../../components/Lock';
import NotFound from '../../views/NotFound';
import ProfileDTO from '../../model/user/ProfileDTO';

const isNil = require('lodash/isNil');
var ps;

class Pages extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      profile: null,
      label: null,
      darkMode: false,
      activeColor: 'blue',
      sidebarMini: true,
      opacity: 0,
      sidebarOpened: false
    };
  }

  async componentDidMount() {
    if ( navigator.platform.indexOf( 'Win' ) > -1 ) {
      document.documentElement.className += ' perfect-scrollbar-on';
      document.documentElement.classList.remove( 'perfect-scrollbar-off' );
      ps = new PerfectScrollbar( this.refs.mainPanel );
      let tables = document.querySelectorAll( '.table-responsive' );
      for ( let i = 0; i < tables.length; i++ ) {
        ps = new PerfectScrollbar( tables[ i ] );
      }
    }
    //document.body.classList.toggle( 'white-content' );

    window.addEventListener( 'scroll', this.showNavbarButton );
    const { getAccessTokenSilently } = this.props.auth0;
    const accessToken = await getAccessTokenSilently();

    const result = await getLightUsers( accessToken );

    if ( isNil(result.error) || !result.error ) {
      const profile = new ProfileDTO( result.data );
      const language = profile && profile.language ? result.data.language : 'fr';
      this.setState(
          {
            label: label[ language ],
            profile: profile
          });
          //{ label: label[ language ],
        //vckeySelected: result.data.vcKeySelected, language: language } );
    } else {

      const {
        logout
      } = this.props.auth0;

      logout( { returnTo: window.location.origin } );
      //this.setState( { label: label[ 'fr' ] } );
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
      this.setState( { opacity: 1 } );
    } else if (
        document.documentElement.scrollTop <= 50 ||
        document.scrollingElement.scrollTop <= 50 ||
        this.refs.mainPanel.scrollTop <= 50
    ) {
      this.setState( { opacity: 0 } );
    }
  };
  getRoutes = routes => {
    return routes.map( ( prop, key ) => {
      if ( prop.collapse ) {
        return this.getRoutes( prop.views );
      }
      if ( prop.layout === '/auth' ) {
        return (
            <Route
                path={prop.layout + prop.path}
                render={(props) => <prop.component label={this.state.label} {...props}/>}
                key={key}
            />
        );
      } else {
        return null;
      }
    } , this);
  };
  getActiveRoute = routes => {
    let activeRoute = 'Ulegalize';
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
  switchLawfirm = async (newVcKeySelected) => {
    const { getAccessTokenSilently } = this.props.auth0;
    const accessToken = await getAccessTokenSilently();

    const result = await switchLawfirm( accessToken, newVcKeySelected );

    if ( isNil( result.error ) || !result.error ) {
      this.setState( { profile: { ...this.state.profile, vckeySelected: result.data } } );

      this.props.history.push( '/' );
    }
  };

  _changeLanguage = (language) => {
    this.setState( {
      label: label[language]
    } );
  };
  render() {
    if ( isNil( this.state.label ) ) {
      return (
          <div
              className="main-panel"
              ref="mainPanel"
          >
            <Lock message="Waiting ..."/>
          </div>
      );
    }
    const root = routes(this.state.label);

    return (
        <div className="wrapper">
          <div
              className="main-panel"
              ref="mainPanel"
              data={this.state.activeColor}
          >
            <AuthNavbar
                {...this.props}
                switchLawfirm={this.switchLawfirm}
                userId={this.state.profile ? this.state.profile.userId : 0}
                vckeySelected={this.state.profile ? this.state.profile.vckeySelected : ''}
                label={this.state.label}
                handleMiniClick={this.handleMiniClick}
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
                        email={this.state.profile ? this.state.profile.email : ''}
                        currency={this.state.profile ? this.state.profile.symbolCurrency : ''}
                        vckeySelected={this.state.profile ? this.state.profile.vcKeySelected : ''}
                        userId={this.state.profile ? this.state.profile.userId : ''}
                        fullName={this.state.profile ? this.state.profile.fullName : ''}
                        language={this.state.profile ? this.state.profile.language : ''}
                        auth0={this.props.auth0}
                        label={this.state.label}

                        {...props}
                    />}
              />
            </Switch>
            {// we don't want the Footer to be rendered on full screen maps page
              this.props.location.pathname.indexOf( 'full-screen-map' ) !==
              -1 ? null : (
                  <Footer
                      language={this.state.profile ? this.state.profile.language : 'fr'}
                      changeLanguage={this._changeLanguage} fluid/>
              )}
          </div>
        </div>
    );
  }
}

export default withAuth0( Pages );
