import React, { Component } from 'react';
import {Button} from 'reactstrap';

export class Classement extends Component {
   render() {
      const {classement} = this.props;
      const nomClassement = classement ? classement.description : null ;
      return (
         <li style={{whiteSpace: "nowrap"}}>
            {nomClassement}
            &nbsp;&nbsp;&nbsp;
            <Button color="link" onClick={() => this.props.removeClassement(nomClassement)}>&times;</Button>
         </li>
      )
   }
}
export default Classement
