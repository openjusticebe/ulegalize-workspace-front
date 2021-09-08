import React, { Component } from 'react';
import { Link, Redirect, Route, Router, Switch } from 'react-router-dom';
import { withAuth0 } from '@auth0/auth0-react';

import AuthLayout from 'layouts/Auth/Auth.jsx';
import AdminLayout from 'layouts/Admin/Admin.jsx';
import Login from './views/pages/Login';
import { createBrowserHistory } from 'history';
import Callback from './Callback';
import PrivateRoute from './routes/PrivateRoute';
import { switchLawfirm } from './services/LawfirmsService';
import Lock from './components/Lock';
import {
    Collapse,
    Container, DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav, Navbar,
    NavLink,
    UncontrolledDropdown
} from 'reactstrap';
import NotFound from './views/NotFound';
import label from './data/label';
import Dropbox from './Dropbox';

let moment = require( 'moment-timezone' );

const hist = createBrowserHistory();
moment.tz.setDefault( 'Europe/Brussels' );

class App extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            vckeySelected: '',
            label: {},
            checkingSession: true,
            loggedIn: false
        };
    }

    async componentDidMount() {
        //if (this.props.location.pathname === '/callback') {
        //    this.setState({checkingSession:false});
        //    return;
        //}
        try {
            //await auth.silentAuth();
            this.forceUpdate();
        } catch ( err ) {
            if ( err.error !== 'login_required' ) {
                console.log( err.error );
            }
        }

            this.setState( { checkingSession: false } );

    }

    switchLawfirm = async ( newVcKeySelected ) => {
        const { getAccessTokenSilently } = this.props.auth0;
        const accessToken = await getAccessTokenSilently();

        const result = await switchLawfirm( accessToken, newVcKeySelected );

        if ( !result.error ) {
            this.setState( { vckeySelected: result.data } );

            this.props.history.push( '/' );
        }

    };

    getInitialLoginData() {
        const { checkingSession } = this.state;

        if ( !checkingSession ) {
            //this.props.history.push( '/login' );
            return;
        }
    }

    loggedIn() {
        this.setState( { loggedIn: true } );
    }

    loggedOut() {
        this.setState( { loggedIn: false } );
    }

    render() {
// this.props.auth0 has all the same properties as the `useAuth0` hook
        const {
            isLoading,
            isAuthenticated,
            error,
            logout
        } = this.props.auth0;
        const { checkingSession } = this.state;

        if ( isLoading || (checkingSession && isAuthenticated)) {
            return (
                <Lock message="Loading App"/>
            );
        }
        if ( error ) {
            return (
                <div className="content">
                    <Navbar
                        expand="lg"
                    >
                        <Container fluid>
                            <div className="navbar-wrapper">
                                <div className="navbar-minimize d-inline">
                                </div>
                            </div>
                            <Collapse navbar isOpen={true}>
                                <Nav className="ml-auto" navbar>
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

                                            <p className="d-lg-none">Log out</p>
                                        </DropdownToggle>
                                        <DropdownMenu className="dropdown-navbar" right tag="ul">
                                            <NavLink tag="li">
                                                <DropdownItem
                                                    onClick={() => {
                                                        logout( { returnTo: window.location.origin } );
                                                    }}
                                                    className="nav-item">Log out</DropdownItem>
                                            </NavLink>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                    <li className="separator d-lg-none"/>
                                </Nav>
                            </Collapse>
                        </Container>
                    </Navbar>
                <h3 className="text-center">Oops... {error.message}</h3>
                    <Link to={`/`}>Click</Link>
            </div>);
        }

        let labelDefault = label[ 'fr' ];


        let route = (<Login/>);
        //let route = null;

        if ( isAuthenticated ) {
            route = (
                <Switch>
                    <Route exact path='/callback' component={Callback}/>
                    <Route exact path='/dropbox' component={Dropbox}/>
                    <PrivateRoute path="/auth" render={props => <AuthLayout {...props} />}/>
                    <PrivateRoute path="/admin" render={( props ) => {
                        this.getInitialLoginData();
                        return (<AdminLayout {...props}/>);
                    }}/>
                    <Redirect exact from="/" to="/admin/dashboard"/>
                    <Route
                        render={
                            ( props ) => <NotFound
                                email={''}
                                label={labelDefault}

                                {...props}
                            />}
                    />
                </Switch>
            );
        }

        return (
            <div>
                <Router history={hist}>
                    {route}
                </Router>
            </div>
        );
    }
}

export default withAuth0( App );