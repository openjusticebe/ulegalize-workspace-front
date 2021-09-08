import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Input,
  Row,
  Label,
  Col,
} from "reactstrap";
import Select from "react-select";
import { useAuth0 } from "@auth0/auth0-react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { updateAdminFraisType } from "../../services/AdminService";
import FraisAdminDTO from "../../model/fraisadmin/FraisAdminDTO";

export default function AdministrativeExpensesModal({
  modal,
  toggleIn,
  item,
  label,
  handleSucess,
  handleError,
  selectDataMesure,
}) {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedOptionMesure, setSelectedOptionMesure] = useState(
    item.idMesureTypeItem
  );
  const [itemName, setItemName] = useState(item.debourDescription);
  const [itemPrice, setItemPrice] = useState(item.pricePerUnit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItemName(item.debourDescription);
    setItemPrice(item.pricePerUnit);
    setSelectedOptionMesure(item.idMesureTypeItem);
  }, [item, modal]);

  const handleOptionSelection = async (value) => {
    setSelectedOptionMesure(value);
  };

  const handleSave = async () => {
    if (itemName.trim() !== "") {
      if (itemPrice !== 0) {
        setLoading(true);
        let obj = new FraisAdminDTO({
          idDebourType: item.idDebourType,
          debourDescription: itemName.trim(),
          pricePerUnit: itemPrice,
          idMesureType: selectedOptionMesure.value,
          idMesureTypeItem: selectedOptionMesure,
          archived: item.archived,
        });

        const accessToken = await getAccessTokenSilently();
        let result = await updateAdminFraisType(
          accessToken,
          item.idDebourType,
          obj
        );
        if (!result.error) {
          handleSucess(obj);
          setLoading(false);
        } else {
          handleError(label.benefits.label13);
          setLoading(false);
        }
      } else {
        handleError(label.administrativeexpenses.label12);
      }
    } else {
      handleError(label.administrativeexpenses.label4);
    }
  };

  return (
    <Modal size="md" isOpen={modal} toggle={toggleIn}>
      <ModalHeader toggle={toggleIn}>
        <h4>{label.administrativeexpenses.label5}</h4>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={3} lg={3}>
            <Label>{label.administrativeexpenses.label6}</Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Input
                value={itemName}
                type="text"
                onChange={(e) => setItemName(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <Label>{label.administrativeexpenses.label13}</Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Input
                value={itemPrice}
                type="number"
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <Label></Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Select
                menuPlacement="top"
                name="optionGroup"
                className="react-select drop-up"
                classNamePrefix="react-select"
                value={selectedOptionMesure}
                defaultValue={selectedOptionMesure}
                onChange={handleOptionSelection}
                options={selectDataMesure}
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => toggleIn()}>
          {label.common.close}
        </Button>
        {loading && <CircularProgress color="primary" size={35} />}
        <Button color="primary" onClick={handleSave} disable={loading}>
          {label.common.save}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
