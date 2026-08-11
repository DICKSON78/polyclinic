import React, { useEffect, useRef, useState, useMemo } from "react";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import CreatePatientAttachment from "./CreatePatientAttachment";
import EditPatientAttachment from "./EditPatientAppointment";
import PrescriptionPDF from "../../../pages/consultation-room/prescriptions/PrescriptionPDF";
import PatientFilePDF from "../patient-file/PatientFilePDF";
import PatientFileView from "../patient-file/PatientFileView";
import ReferralPDF from "../../../pages/consultation-room/referrals/ReferralPDF";

import { useFetch, useToast } from "../../../hooks";
import { formatError, getFileExtension } from "../../../helpers";

const PatientAttachments = ({ patient, readOnly }) => {
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: patient.id,
  });

  // Fetch manual attachments
  const { data: attachmentsData, loading: attachmentsLoading, error: attachmentsError, handleFetch } = useFetch(
    "api/patient-attachments",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      // Handle paginated response from Laravel
      const paginatedData = response?.data?.data || response?.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        page: paginatedData.current_page || paginatedData.page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  // Fetch consultations for the patient
  const { data: consultationsData, loading: consultationsLoading } = useFetch(
    "api/consultations",
    {
      patient_id: patient.id,
      per_page: 1000, // Get all consultations
      with_items: "Yes",
      with_diagnoses: "Yes",
    },
    true,
    [],
    (response) => {
      const payload = response?.data?.data || response?.data || {};
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      return Array.isArray(list) ? list : [];
    }
  );

  // Fetch referrals for the patient
  const { data: referralsData, loading: referralsLoading } = useFetch(
    "api/referrals",
    {
      patient_id: patient.id,
      per_page: 1000,
    },
    true,
    {
      data: [],
      total: 0,
    },
    (response) => {
      const payload = response?.data?.data || response?.data || {};
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      return Array.isArray(list) ? list : [];
    }
  );

  // Combine all attachments into a single list
  const allAttachments = useMemo(() => {
    const items = [];

    // Add manual attachments
    if (attachmentsData?.data) {
      attachmentsData.data.forEach((attachment) => {
        items.push({
          id: `attachment-${attachment.id}`,
          type: 'attachment',
          title: attachment.title,
          description: attachment.description,
          path: attachment.path,
          created_by: attachment.creator?.full_name,
          created_at: attachment.created_at,
          attachment: attachment,
        });
      });
    }

    // Add consultations (clinical notes and prescriptions)
    if (consultationsData && Array.isArray(consultationsData)) {
      consultationsData.forEach((consultation) => {
        const consultationPatient = consultation.payment_cache_item?.payment_cache?.check_in?.patient || patient;
        const consultationDate = consultation.created_at || consultation.payment_cache_item?.created_at;
        const createdBy = consultation.creator?.full_name || 'N/A';

        // Add clinical notes
        items.push({
          id: `clinical-notes-${consultation.id}`,
          type: 'clinical_notes',
          title: `Clinical Notes - ${new Date(consultationDate).toLocaleDateString()}`,
          description: `Consultation #${consultation.id}`,
          consultation: consultation,
          patient: consultationPatient,
          created_by: createdBy,
          created_at: consultationDate,
        });

        // Add prescription if consultation has pharmacy items or require_glass
        const hasPharmacyItems = consultation.items?.some(item => item.consultation_type?.name === "Pharmacy");
        const hasRequireGlass = consultation.require_glass === 'Yes';
        
        if (hasPharmacyItems || hasRequireGlass) {
          items.push({
            id: `prescription-${consultation.id}`,
            type: 'prescription',
            title: `Prescription - ${new Date(consultationDate).toLocaleDateString()}`,
            description: `Consultation #${consultation.id}`,
            consultation: consultation,
            patient: consultationPatient,
            created_by: createdBy,
            created_at: consultationDate,
          });
        }
      });
    }

    // Add referrals
    if (referralsData && Array.isArray(referralsData)) {
      referralsData.forEach((referral) => {
        items.push({
          id: `referral-${referral.id}`,
          type: 'referral',
          title: `Referral to ${referral.referred_to_name || 'N/A'}`,
          description: referral.referral_reason || referral.clinical_summary || 'Referral',
          referral: referral,
          created_by: referral.creator?.full_name || 'N/A',
          created_at: referral.created_at || referral.referral_date,
        });
      });
    }

    // Sort by created_at descending
    items.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });

    return items;
  }, [attachmentsData, consultationsData, referralsData, patient]);

  useEffect(() => {
    if (attachmentsError) {
      addToast({ message: formatError(attachmentsError), severity: "error" });
    }
  }, [attachmentsError, addToast]);

  const openCreatePatientAttachmentModal = () => {
    let component = (
      <CreatePatientAttachment
        patient={patient}
        modal={modalRef.current}
        fetchPatientAttachments={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Attachment", component, "sm");
  };

  const openEditPatientAttachmentModal = (item) => {
    let component = (
      <EditPatientAttachment
        item={item.attachment}
        modal={modalRef.current}
        fetchPatientAttachments={handleFetch}
      />
    );

    modalRef.current.open("Edit Attachment", component, "sm");
  };

  const renderAttachmentCell = (item) => {
    if (item.type === 'attachment') {
      return (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View attachment">
            <Chip
              size="small"
              color="primary"
              label={getFileExtension(item.path)}
              clickable
              onClick={() => window.open(`/${item.path}`, "_blank")}
            />
          </Tooltip>
        </Stack>
      );
    } else if (item.type === 'clinical_notes') {
      return (
        <Tooltip title="Download Clinical Notes PDF">
          <Chip
            size="small"
            color="secondary"
            label="PDF"
            icon={<DownloadIcon fontSize="small" />}
            clickable
          />
        </Tooltip>
      );
    } else if (item.type === 'prescription') {
      return (
        <Tooltip title="Download Prescription PDF">
          <Chip
            size="small"
            color="info"
            label="PDF"
            icon={<DownloadIcon fontSize="small" />}
            clickable
          />
        </Tooltip>
      );
    } else if (item.type === 'referral') {
      return (
        <Tooltip title="Referral Document">
          <Chip
            size="small"
            color="warning"
            label="Referral"
          />
        </Tooltip>
      );
    }
    return null;
  };

  const openViewModal = (item) => {
    let component;
    let title;

    if (item.type === 'clinical_notes') {
      component = (
        <PatientFileView
          consultationId={item.consultation.id}
          patient={item.patient}
          modal={modalRef.current}
        />
      );
      title = "View Clinical Notes";
    } else if (item.type === 'prescription') {
      // For prescriptions, show prescription details in a simple format
      component = (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <div>
                <strong>Patient:</strong> {item.patient?.full_name || patient?.full_name}
              </div>
              <div>
                <strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Consultation:</strong> #{item.consultation.id}
              </div>
              {item.consultation?.items && item.consultation.items.length > 0 && (
                <div>
                  <strong>Prescribed Items:</strong>
                  <ul>
                    {item.consultation.items
                      .filter(item => item.consultation_type?.name === "Pharmacy")
                      .map((prescribedItem, index) => (
                        <li key={index}>
                          {prescribedItem.item?.name || 'Unknown Item'} - Quantity: {prescribedItem.quantity}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {item.consultation?.require_glass === 'Yes' && (
                <div>
                  <strong>Requires Item:</strong> Yes
                </div>
              )}
            </Stack>
          </CardContent>
        </Card>
      );
      title = "View Prescription";
    } else if (item.type === 'referral') {
      // For referrals, show referral details
      component = (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <div>
                <strong>Patient:</strong> {patient?.full_name}
              </div>
              <div>
                <strong>Referred To:</strong> {item.referral?.referred_to_name || 'N/A'}
              </div>
              <div>
                <strong>Referral Reason:</strong> {item.referral?.referral_reason || 'N/A'}
              </div>
              <div>
                <strong>Clinical Summary:</strong> {item.referral?.clinical_summary || 'N/A'}
              </div>
              <div>
                <strong>Referral Date:</strong> {item.referral?.referral_date ? new Date(item.referral.referral_date).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <strong>Created By:</strong> {item.referral?.creator?.full_name || 'N/A'}
              </div>
            </Stack>
          </CardContent>
        </Card>
      );
      title = "View Referral";
    }

    if (component) {
      modalRef.current.open(title, component, "md");
    }
  };

  const renderActionCell = (item) => {
    if (item.type === 'attachment' && !readOnly) {
      return (
        <Stack
          direction="row"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              sx={{ height: 16 }}
            />
          }
          spacing={1}
        >
          <Tooltip title="View attachment">
            <IconButton
              size="small"
              color="primary"
              onClick={() => window.open(`/${item.path}`, "_blank")}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => openEditPatientAttachmentModal(item)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    } else if (item.type === 'clinical_notes') {
      return (
        <Stack
          direction="row"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              sx={{ height: 16 }}
            />
          }
          spacing={1}
        >
          <Tooltip title="View Clinical Note">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openViewModal(item)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <PatientFilePDF
            consultationId={item.consultation.id}
            patient={item.patient}
            consultation={item.consultation}
            size="small"
          />
        </Stack>
      );
    } else if (item.type === 'prescription') {
      return (
        <Stack
          direction="row"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              sx={{ height: 16 }}
            />
          }
          spacing={1}
        >
          <Tooltip title="View Prescription">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openViewModal(item)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <PrescriptionPDF
            consultationId={item.consultation.id}
            patient={item.patient}
            consultation={item.consultation}
            size="small"
          />
        </Stack>
      );
    } else if (item.type === 'referral') {
      return (
        <Stack
          direction="row"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              sx={{ height: 16 }}
            />
          }
          spacing={1}
        >
          <Tooltip title="View Referral">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openViewModal(item)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <ReferralPDF
            referral={item.referral}
            patient={item.patient || patient}
            size="small"
          />
        </Stack>
      );
    }
    return null;
  };

  const loading = attachmentsLoading || consultationsLoading || referralsLoading;

  return (
    <React.Fragment>
      <Card sx={{ 
        borderTopLeftRadius: 0,
        width: "100%",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) => index + 1,
              },
              {
                field: "title",
                headerName: "Title",
              },
              {
                field: "description",
                headerName: "Description",
              },
              {
                field: "type",
                headerName: "Type",
                valueGetter: (item) => {
                  const typeMap = {
                    'attachment': 'Attachment',
                    'clinical_notes': 'Clinical Notes',
                    'prescription': 'Prescription',
                    'referral': 'Referral',
                  };
                  return typeMap[item.type] || item.type;
                },
              },
              {
                field: "path",
                headerName: "File",
                renderCell: renderAttachmentCell,
              },
              {
                field: "created_by",
                headerName: "Created By",
              },
              {
                field: "created_at",
                headerName: "Date Created",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: renderActionCell,
                show: true,
              },
            ]}
            items={allAttachments}
            itemCount={allAttachments.length}
            page={1}
            pageSize={1000}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            footerItems={
              !readOnly
                ? [
                    [
                      { value: "", tableCellProps: { colSpan: 7 } },
                      {
                        value: (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={openCreatePatientAttachmentModal}
                          >
                            New Attachment
                          </Button>
                        ),
                      },
                    ],
                  ]
                : null
            }
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default PatientAttachments;
