import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const RefractionDetails = (
  { consultation: { id, status, refraction } },
  ref
) => {
  const obReSphRef = useRef();
  const obReCylRef = useRef();
  const obReAxisRef = useRef();
  const obReVaRef = useRef();
  const obLeSphRef = useRef();
  const obLeCylRef = useRef();
  const obLeAxisRef = useRef();
  const obLeVaRef = useRef();
  const subReSphRef = useRef();
  const subReCylRef = useRef();
  const subReAxisRef = useRef();
  const subReVaRef = useRef();
  const subReAddRef = useRef();
  const subReAddVaRef = useRef();
  const subLeSphRef = useRef();
  const subLeCylRef = useRef();
  const subLeAxisRef = useRef();
  const subLeVaRef = useRef();
  const subLeAddRef = useRef();
  const subLeAddVaRef = useRef();

  const [formData, setFormData] = useState(refraction);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!refraction || (refraction && value !== refraction[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Refraction",
        [field]: value,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      return true;
    },
    getFormData: () => formData,
  }));

  return (
    <React.Fragment>
      <Table sx={{ mb: 2, width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={8}>Objective Examination</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}>RE</TableCell>
            <TableCell colSpan={4}>LE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th">SPH</TableCell>
            <TableCell component="th">CYL</TableCell>
            <TableCell component="th">AXIS</TableCell>
            <TableCell component="th">VA</TableCell>
            <TableCell component="th">SPH</TableCell>
            <TableCell component="th">CYL</TableCell>
            <TableCell component="th">AXIS</TableCell>
            <TableCell component="th">VA</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TextField
                ref={obReSphRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_re_sph : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_re_sph: value });
                  autoSave("ob_re_sph", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obReCylRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_re_cyl : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_re_cyl: value });
                  autoSave("ob_re_cyl", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obReAxisRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_re_axis : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_re_axis: value });
                  autoSave("ob_re_axis", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obReVaRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_re_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_re_va: value });
                  autoSave("ob_re_va", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeSphRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_le_sph : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_le_sph: value });
                  autoSave("ob_le_sph", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeCylRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_le_cyl : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_le_cyl: value });
                  autoSave("ob_le_cyl", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeAxisRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_le_axis : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_le_axis: value });
                  autoSave("ob_le_axis", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeVaRef}
                fullWidth
                defaultValue={refraction ? refraction.ob_le_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, ob_le_va: value });
                  autoSave("ob_le_va", value);
                }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={8}>Subjective Examination</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}>RE</TableCell>
            <TableCell colSpan={4}>LE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th">SPH</TableCell>
            <TableCell component="th">CYL</TableCell>
            <TableCell component="th">AXIS</TableCell>
            <TableCell component="th">VA</TableCell>
            <TableCell component="th">SPH</TableCell>
            <TableCell component="th">CYL</TableCell>
            <TableCell component="th">AXIS</TableCell>
            <TableCell component="th">VA</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TextField
                ref={subReSphRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_re_sph : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_re_sph: value });
                  autoSave("sub_re_sph", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReCylRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_re_cyl : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_re_cyl: value });
                  autoSave("sub_re_cyl", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReAxisRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_re_axis : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_re_axis: value });
                  autoSave("sub_re_axis", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReVaRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_re_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_re_va: value });
                  autoSave("sub_re_va", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeSphRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_le_sph : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_le_sph: value });
                  autoSave("sub_le_sph", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeCylRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_le_cyl : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_le_cyl: value });
                  autoSave("sub_le_cyl", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeAxisRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_le_axis : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_le_axis: value });
                  autoSave("sub_le_axis", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeVaRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_le_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_le_va: value });
                  autoSave("sub_le_va", value);
                }}
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell component="th">ADD</TableCell>
            <TableCell component="th">VA</TableCell>
            <TableCell component="th" />
            <TableCell component="th" />
            <TableCell component="th">ADD</TableCell>
            <TableCell component="th">VA</TableCell>
            <TableCell component="th" />
            <TableCell component="th" />
          </TableRow>
          <TableRow>
            <TableCell>
              <TextField
                ref={subReAddRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_re_add : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_re_add: value });
                  autoSave("sub_re_add", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReAddVaRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_re_add_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_re_add_va: value });
                  autoSave("sub_re_add_va", value);
                }}
              />
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell>
              <TextField
                ref={subLeAddRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_le_add : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_le_add: value });
                  autoSave("sub_le_add", value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeAddVaRef}
                fullWidth
                defaultValue={refraction ? refraction.sub_le_add_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, sub_le_add_va: value });
                  autoSave("sub_le_add_va", value);
                }}
              />
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

export default forwardRef(RefractionDetails);
