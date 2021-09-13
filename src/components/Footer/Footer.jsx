/*eslint-disable*/
import React, { useState } from 'react';
import { Col, Container, FormGroup, Row, Table } from 'reactstrap';
// used for making the prop types of this component
import Select from 'react-select';
import { changeLanguage } from '../../services/LanguageService';
import { useAuth0 } from '@auth0/auth0-react';
const find = require( 'lodash/find' );

export default function Footer (props) {
  const _moveOptionData = [
    {
      'value': 'fr',
      'label': 'FR',
    },
    {
      'value': 'en',
      'label': 'EN',
    },
    {
      'value': 'nl',
      'label': 'NL',
    },
  ]
  const [moveOptionData, setMoveOptionData] = useState(_moveOptionData);
  const {language} = props;

  const languageDefault = find(_moveOptionData, { 'value': language })
  const [selectedOption, setSelectedOption] = useState(languageDefault)
  const { getAccessTokenSilently } = useAuth0();

  const onChangeOptionSelection = async (value) => {
    setSelectedOption(value);

    const accessToken = await getAccessTokenSilently();

    let result = await changeLanguage( accessToken, value.value );

    if ( !result.error ) {
      props.changeLanguage(result.data);
    }
  }
  return (
      <footer
        className={"footer" + (props.default ? " footer-default" : "")}
      >
        <Container fluid={props.fluid ? true : false}>
          <Row>
            <Col md="3" >
                <div className="copyright">
                  © <a href={process.env.REACT_APP_WWW_URL} target="_blank">
                  Powered by Ulegalize
                </a> {" "} {new Date().getFullYear()}
                  <a href={process.env.REACT_APP_CONFLUENCE} target="_blank">
                    {" "}version {process.env.REACT_APP_VERSION} {" "}
                  </a>
                </div>
            </Col>
            <Col md={{ size:1, offset:7 }}>
              <FormGroup>
                <Select
                    menuPlacement="top"
                    name='optionGroup'
                    className="react-select drop-up"
                    classNamePrefix="react-select"
                    value={selectedOption}
                    onChange={onChangeOptionSelection}
                    options={moveOptionData}
                />
              </FormGroup>
            </Col>
            <Col md="1" >
            </Col>
          </Row>
        </Container>
      </footer>
    );
}

