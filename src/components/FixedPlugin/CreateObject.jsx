import React, { Component } from 'react';
// react plugin used to create switch buttons
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from 'reactstrap';

class CreateObject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: "dropdown",
      horizontalDetailsTabs: 'prestation',
    };
  }
  handleClick = () => {
    if (this.state.classes === "dropdown") {
      this.setState({ classes: "dropdown show" });
    } else {
      this.setState({ classes: "dropdown" });
    }
  };
  // with this function we change the active tab for all the tabs in this page
  changeActiveTab = ( e, tabState, tadName ) => {
    e.preventDefault();
    this.setState( {
      [ tabState ]: tadName
    } );
  };

  render() {
    return (
        <Button className="btn-round" color="primary">
          <i className="tim-icons icon-heart-2" /> with icon
        </Button>
    );
  }
}

export default CreateObject;
