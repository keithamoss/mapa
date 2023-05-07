import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { groupBy, sortBy } from "lodash-es";
import React from "react";
import { Feature } from "../../../app/services/features";
import {
  FeatureSchemaSymbology,
  FeatureSchemaSymbologySymbolsValue,
} from "../../../app/services/schemas";
import { DialogWithTransition } from "../../../app/ui/dialog";
import { defaultNakedDialogColour } from "../../../app/ui/theme";
import {
  defaultSymbolSizeForFormFields,
  defaultSymbologyGroupId,
  getFontAwesomeIconForSymbolPreview,
  getSymbolFromSchemaSymbology,
  getSymbolGroups,
  getSymbologyGroupById,
} from "../../symbology/symbologyHelpers";

interface SymbologyAutocompleteOption {
  symbol: FeatureSchemaSymbologySymbolsValue;
  option_group: string;
}

const getSymbolsMostlyCommonlyUsedOnThisMapForThisSchema = (
  schemaId: number,
  symbology: FeatureSchemaSymbology,
  features: Feature[]
) => {
  if (features === undefined) {
    return [];
  }

  const featuresGroupedBySymbol = Object.values(
    groupBy(
      Object.values(features).filter(
        (feature) => feature.schema_id === schemaId
      ),
      (f) => f.symbol_id
    )
  );

  const featuresGroupedWithCountOfSymbols = featuresGroupedBySymbol
    .map((v, i) => ({
      symbolId: v[0].symbol_id,
      count: v.length,
    }))
    .filter((i) => i.symbolId !== null);

  const symbolIdsGroupedAndSorted = sortBy(
    featuresGroupedWithCountOfSymbols,
    (i) => i.count
  ).reverse();

  const symbolsGroupedAndSorted = symbolIdsGroupedAndSorted
    .slice(0, 3)
    .map((i) =>
      i.symbolId !== null
        ? getSymbolFromSchemaSymbology(i.symbolId, symbology)
        : null
    );

  return symbolsGroupedAndSorted as FeatureSchemaSymbologySymbolsValue[];
};

const getSymbolOptions = (
  mapId: number,
  schemaId: number,
  symbology: FeatureSchemaSymbology,
  features: Feature[]
) => {
  const favouritedSymbols = symbology.symbols
    .filter((symbol) => symbol.favourited_map_ids.includes(mapId))
    .map((symbol) => ({ symbol, option_group: "Favourites" }));

  const mostCommonlyUsedOnThisMap =
    getSymbolsMostlyCommonlyUsedOnThisMapForThisSchema(
      schemaId,
      symbology,
      features !== undefined ? Object.values(features) : []
    ).map((symbol) => ({
      symbol,
      option_group: "Frequently used on this map",
    }));

  const availableSymbols = sortBy(
    [...symbology.symbols],
    (i) => i.group_id
  ).map((symbol) => ({
    symbol,
    option_group: getSymbologyGroupById(symbol.group_id, symbology)?.name || "",
  }));

  return groupBy(
    [...favouritedSymbols, ...mostCommonlyUsedOnThisMap, ...availableSymbols],
    "option_group"
  );
};

const createSymbolListItem = (
  option: SymbologyAutocompleteOption,
  onClickSymbol: (symbol: FeatureSchemaSymbologySymbolsValue) => () => void
) => (
  <ListItem
    key={`${option.symbol.group_id}-${option.symbol.id}`}
    disablePadding
  >
    <ListItemButton onClick={onClickSymbol(option.symbol)}>
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: grey[50],
            width: "45px",
            height: "45px",
            "& > img": { width: 25, height: 25 },
          }}
        >
          {getFontAwesomeIconForSymbolPreview(option.symbol.props, {
            size: defaultSymbolSizeForFormFields,
          })}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={option.symbol.props.name} />
    </ListItemButton>
  </ListItem>
);

interface Props {
  mapId: number;
  schemaId: number;
  symbology: FeatureSchemaSymbology;
  symbolId: number | null;
  features: Feature[];
  onChoose: (symbol: FeatureSchemaSymbologySymbolsValue | null) => void;
  onClose: () => void;
}

function SchemaSymbologyChooser(props: Props) {
  console.log("### SchemaSymbologyChooser ###");

  const {
    mapId,
    schemaId,
    symbology,
    // symbolId,
    features,
    onChoose,
    onClose,
  } = props;

  const optionsGrouped = getSymbolOptions(mapId, schemaId, symbology, features);

  const onClickSymbol = (symbol: FeatureSchemaSymbologySymbolsValue) => () =>
    onChoose(symbol);

  return (
    <React.Fragment>
      <DialogWithTransition themeColour={defaultNakedDialogColour}>
        <DialogTitle>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Paper
          elevation={0}
          sx={{
            m: 3,
          }}
        >
          <List
            sx={{
              width: "100%",
              maxWidth: 360,
              bgcolor: "background.paper",
            }}
          >
            {optionsGrouped["Favourites"] !== undefined && (
              <React.Fragment>
                <ListSubheader sx={{ mt: 0 }} color="primary" disableGutters>
                  Favourites
                </ListSubheader>

                {optionsGrouped["Favourites"].map((option, index) =>
                  createSymbolListItem(option, onClickSymbol)
                )}
              </React.Fragment>
            )}

            {optionsGrouped["Frequently used on this map"] !== undefined && (
              <React.Fragment>
                <ListSubheader
                  sx={{
                    mt: optionsGrouped["Favourites"] !== undefined ? 2 : 0,
                  }}
                  color="primary"
                  disableGutters
                >
                  Frequently used on this map
                </ListSubheader>

                {optionsGrouped["Frequently used on this map"].map(
                  (option, index) => createSymbolListItem(option, onClickSymbol)
                )}
              </React.Fragment>
            )}

            {getSymbolGroups(symbology).map((symbologyGroup, idx) => (
              <React.Fragment key={symbologyGroup.id}>
                {optionsGrouped[symbologyGroup.name] !== undefined && (
                  <React.Fragment key={symbologyGroup.id}>
                    <ListSubheader
                      sx={{
                        mt:
                          (optionsGrouped["Favourites"] !== undefined ||
                            optionsGrouped["Frequently used on this map"] !==
                              undefined) &&
                          symbologyGroup.id === defaultSymbologyGroupId
                            ? 2
                            : 0,
                      }}
                      color="primary"
                      disableGutters
                    >
                      {symbologyGroup.name}
                    </ListSubheader>

                    {optionsGrouped[symbologyGroup.name].map((option, index) =>
                      createSymbolListItem(option, onClickSymbol)
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </DialogWithTransition>
    </React.Fragment>
  );
}

export default SchemaSymbologyChooser;
