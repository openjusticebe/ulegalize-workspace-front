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
import { updateAdminBankAccountType } from "../../services/AdminService";

export default function BankAccountsModal({
  modal,
  toggleIn,
  item,
  label,
  handleSucess,
  handleError,
  dataAccountType,
}) {
  const { getAccessTokenSilently } = useAuth0();
  const [accountNumber, setAccountNumber] = useState(item.accountNumber);
  const [accountDescription, setAccountDescription] = useState(item.accountRef);
  const [selectedOptionAccountType, setSelectedOptionAccountType] = useState(
    item.dataAccountType
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAccountNumber(item.accountNumber);
    setAccountDescription(item.accountRef);
    setSelectedOptionAccountType(item.accountTypeIdItem);
  }, [item, modal]);

  const handleOptionSelection = async (value) => {
    setSelectedOptionAccountType(value);
  };

  const handleSave = async () => {
    if (accountNumber.trim() !== "") {
      if (accountDescription.trim() !== "") {
        setLoading(true);
        let obj = item
        obj.accountNumber = accountNumber.trim();
        obj.accountRef = accountDescription.trim();
        obj.accountTypeIdItem = selectedOptionAccountType;
        obj.accountTypeId = selectedOptionAccountType.value;
        const accessToken = await getAccessTokenSilently();
        let result = await updateAdminBankAccountType(
          accessToken,
          obj.compteId,
          obj
        );
        if (!result.error) {
          handleSucess(obj);
          setLoading(false);
        } else {
          handleError(label.bankaccounts.label11);
          setLoading(false);
        }
      } else {
        handleError(label.bankaccounts.label10);
      }
    } else {
      handleError(label.bankaccounts.label9);
    }
  };

  return (
    <Modal size="md" isOpen={modal} toggle={toggleIn}>
      <ModalHeader toggle={toggleIn}>
        <h4>{label.bankaccounts.label12}</h4>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={3} lg={3}>
            <Label>{label.bankaccounts.label1}</Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Input
                value={accountNumber}
                type="text"
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <Label>{label.bankaccounts.label5}</Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Select
                name="optionGroup"
                className="react-select drop-up"
                classNamePrefix="react-select"
                value={selectedOptionAccountType}
                defaultValue={selectedOptionAccountType}
                onChange={handleOptionSelection}
                options={dataAccountType}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <Label>{label.bankaccounts.label6}</Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Input
                value={accountDescription}
                type="text"
                onChange={(e) => setAccountDescription(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => toggleIn()}>
          {label.bankaccounts.label8}
        </Button>
        {loading && <CircularProgress color="primary" size={35} />}
        <Button color="primary" onClick={handleSave} disable={loading}>
          {label.bankaccounts.label7}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
