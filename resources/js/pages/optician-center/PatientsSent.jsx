import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const PatientsSent = () => {
  const role = useSelector((state) => state.auth.user.role);
  const navigate = useNavigate();

  const handleSendPatient = () => {
    if (role !== "cashier") {
      alert("Only cashiers can send patients to the dispenser.");
      return;
    }
    navigate("/optician/patient-transfer");
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendPatient}
      >
        Send Patient
      </Button>
    </div>
  );
};

export default PatientsSent;
