import { Schema } from "@mui/icons-material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import {
  Button,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks/store";
import { getSchemasAvailableForMap } from "./schemasSlice";

interface Props {
  mapId: number;
  selectedSchemaId: number | undefined;
  onChooseSchema: (schemaId: number | null) => void;
  onClickEditSchema?: (schemaId: number) => void;
}

function SchemaSelectFormControls(props: Props) {
  console.log("### SchemaSelectFormControls ###");

  const navigate = useNavigate();

  const { mapId, selectedSchemaId, onChooseSchema, onClickEditSchema } = props;

  const availableSchemas = useAppSelector((state) =>
    getSchemasAvailableForMap(state, mapId)
  );

  const onChangeSchema = (e: SelectChangeEvent<number | string>) => {
    const schemaId = parseInt(`${e.target.value}`);
    if (Number.isNaN(schemaId) === false) {
      onChooseSchema(schemaId);
    }
  };

  const onEditSchema = () => {
    if (selectedSchemaId !== undefined) {
      if (onClickEditSchema === undefined) {
        navigate(`/SchemaManager/Edit/${selectedSchemaId}`, {
          state: { source: window.location.pathname },
        });
      } else {
        onClickEditSchema(selectedSchemaId);
      }
    }
  };

  return (
    <React.Fragment>
      {availableSchemas.length === 0 && (
        <Link to="/SchemaManager/Create">
          <Button variant="outlined" startIcon={<Schema color="primary" />}>
            Create your first schema
          </Button>
        </Link>
      )}

      {availableSchemas.length > 0 && (
        <React.Fragment>
          <FormGroup>
            <InputLabel id="schema-select-label">Choose a schema</InputLabel>
            <Select
              labelId="schema-select-label"
              label="Choose a schema"
              value={selectedSchemaId || ""}
              onChange={onChangeSchema}
              sx={{ maxWidth: 350, mb: 2 }}
              fullWidth
            >
              {availableSchemas.map((schema) => (
                <MenuItem key={schema.id} value={schema.id}>
                  {schema.name}
                </MenuItem>
              ))}
            </Select>
          </FormGroup>

          <FormGroup row={true}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEditSchema}
              sx={{ mr: 1 }}
              disabled={selectedSchemaId === undefined}
            >
              Edit
            </Button>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              component={Link}
              to="/SchemaManager/Create/"
            >
              Create
            </Button>
          </FormGroup>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default SchemaSelectFormControls;
