import React, { forwardRef, useImperativeHandle } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const RefractionDetails = ({ consultation }, ref) => {
  const refraction = consultation?.refraction;
  
  useImperativeHandle(ref, () => ({
    validate: () => {
      return true;
    },
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
            <TableCell>{refraction ? (refraction.ob_re_sph || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_re_cyl || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_re_axis || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_re_va || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_le_sph || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_le_cyl || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_le_axis || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.ob_le_va || '-') : '-'}</TableCell>
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
            <TableCell>{refraction ? (refraction.sub_re_sph || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_re_cyl || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_re_axis || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_re_va || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_le_sph || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_le_cyl || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_le_axis || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_le_va || '-') : '-'}</TableCell>
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
            <TableCell>{refraction ? (refraction.sub_re_add || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_re_add_va || '-') : '-'}</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>{refraction ? (refraction.sub_le_add || '-') : '-'}</TableCell>
            <TableCell>{refraction ? (refraction.sub_le_add_va || '-') : '-'}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

export default forwardRef(RefractionDetails);
