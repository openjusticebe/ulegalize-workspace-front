import React from 'react';
import { withAuth0 } from '@auth0/auth0-react';

// nodejs library that concatenates classes
import classNames from 'classnames';
// reactstrap components
import {
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
  UncontrolledDropdown
} from 'reactstrap';
import ModalCreateLawfirm from '../../views/popup/lawfirm/ModalCreateLawfirm';
import { getLawfirmList } from '../../services/LawfirmsService';
import { Link } from 'react-router-dom';
const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );

class AuthNavbar extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      vcKeys: [],
      togglePopupCreateCab: false,
      chronoVisible: false,
      collapseOpen: false,
      modalSearch: false,
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

    if ( isNil(result.error) || !result.error ) {
      this.setState( { vcKeys: result.data } );
    }

  }

  componentWillUnmount() {
    window.removeEventListener( 'resize', this.updateColor );
  }

  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
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
  togglePopupCreateCab = () => {
    this.setState( {
      togglePopupCreateCab: !this.state.togglePopupCreateCab
    } );
  };

  _refreshVckeys = async() => {
    const {
      userId,
    } = this.props;
    const { getAccessTokenSilently } = this.props.auth0;
    const accessToken = await getAccessTokenSilently();

    const result = await getLawfirmList( accessToken, userId );

    if ( isNil(result.error) || !result.error ) {
      this.setState( { vcKeys: result.data } );
    }
  }
  render() {
    const {
      vckeySelected,
      userEmail,
        label
    } = this.props;
    const {
      logout
    } = this.props.auth0;
    return (
        <>
          <Navbar
              className={classNames( 'navbar-absolute', {
                [ this.state.color ]:
                this.props.location.pathname.indexOf( 'full-screen-map' ) === -1
              } )}
              expand="lg"
          >
            <Container fluid>
              <div className="navbar-wrapper">
                <div className="navbar-minimize d-inline">
                </div>
                <div
                    className={classNames( 'navbar-toggle d-inline', {
                      toggled: this.props.sidebarOpened
                    } )}
                >
                  <button
                      className="navbar-toggler"
                      type="button"
                      onClick={this.props.toggleSidebar}
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
              <Collapse navbar isOpen={this.state.collapseOpen}>
                <Nav className="ml-auto" navbar>
                  <InputGroup className="search-bar" tag="li">
                    <UncontrolledDropdown group>
                      <DropdownToggle caret color="danger" className="btn-round" id="headerLabelId1"
                                      data-toggle="dropdown">
                        <i className="fa fa-plus color-white padding-right-7"/> {label.header.label1}
                        {/*<i className="tim-icons icon-simple-add" /> Créer*/}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem tag={Link}
                                      onClick={this.togglePopupCreateCab}>{label.header.label6}</DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
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
                      {this.state.vcKeys ?  map(this.state.vcKeys, lawfirm =>
                      {
                        return (
                            <NavLink tag="li">
                              <DropdownItem onClick={() => this.props.switchLawfirm(lawfirm.vckey)} className="nav-item">
                                {lawfirm.vckey}
                              </DropdownItem>
                            </NavLink>
                        )
                      })  : null}
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

                      <p className="d-lg-none">Log out</p>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-navbar" right tag="ul">
                      <NavLink tag="li">
                        <DropdownItem
                            onClick={() => {
                              logout( { returnTo: window.location.origin } );
                            }}
                            className="nav-item">Logs out</DropdownItem>
                      </NavLink>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <li className="separator d-lg-none"/>
                </Nav>
              </Collapse>
            </Container>
          </Navbar>
          {this.state.togglePopupCreateCab ?
              (
                  <ModalCreateLawfirm
                      refreshVckeys={this._refreshVckeys}
                      showMessage={this._showMessage}
                      history={this.props.history}
                      label={this.props.label}
                      toggle={this.togglePopupCreateCab}
                      openDialog={this.state.togglePopupCreateCab}/>
              ) : null}
        </>
    );
  }
}

export default withAuth0( AuthNavbar );
