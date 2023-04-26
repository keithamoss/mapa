import { Autocomplete, Box, InputAdornment, TextField } from "@mui/material";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { groupBy, sortBy } from "lodash-es";
import { forwardRef } from "react";
import { Feature } from "../../../app/services/features";
import {
  FeatureSchemaSymbology,
  FeatureSchemaSymbologySymbolsValue,
} from "../../../app/services/schemas";
import {
  defaultSymbolSizeForFormFields,
  getFontAwesomeIconForSymbolPreview,
  getSymbolFromSchemaSymbologyGroup,
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
        ? getSymbolFromSchemaSymbologyGroup(i.symbolId, symbology)
        : null
    );

  return symbolsGroupedAndSorted as FeatureSchemaSymbologySymbolsValue[];
};

const getOptionsForAutocomplete = (
  mapId: number,
  schemaId: number,
  symbology: FeatureSchemaSymbology,
  features: Feature[]
): SymbologyAutocompleteOption[] => {
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
      option_group: "Most commonly used on this map",
    }));

  const availableSymbols = sortBy(
    [...symbology.symbols],
    (i) => i.group_id
  ).map((symbol) => ({
    symbol,
    option_group: getSymbologyGroupById(symbol.group_id, symbology)?.name || "",
  }));

  return [
    ...favouritedSymbols,
    ...mostCommonlyUsedOnThisMap,
    ...availableSymbols,
  ];
};

interface Props {
  mapId: number;
  schemaId: number;
  symbology: FeatureSchemaSymbology;
  symbolId: number | null;
  features: Feature[];
  onChooseSymbol: (symbol: FeatureSchemaSymbologySymbolsValue | null) => void;
}

function SchemaSymbologyAutocomplete(props: Props, ref: any) {
  console.log("### SchemaSymbologyAutocomplete ###");

  const { mapId, schemaId, symbology, symbolId, features, onChooseSymbol } =
    props;

  const options = getOptionsForAutocomplete(
    mapId,
    schemaId,
    symbology,
    features
  );

  const onChange = (
    event: React.SyntheticEvent,
    value: SymbologyAutocompleteOption | null
  ) => {
    onChooseSymbol(value?.symbol || null);
  };

  const selectedSymbol =
    symbolId !== null
      ? getSymbolFromSchemaSymbologyGroup(symbolId, symbology)
      : undefined;

  const value =
    selectedSymbol !== undefined
      ? {
          symbol: selectedSymbol,
          option_group: "It doesn't matter",
        }
      : null;

  return (
    <Autocomplete
      fullWidth
      sx={{ maxWidth: 350 }}
      ListboxProps={{ style: { maxHeight: "400px" } }}
      options={options}
      noOptionsText="You haven't created any symbols yet"
      value={value}
      isOptionEqualToValue={(option, value) =>
        option.symbol.id === value.symbol.id
      }
      groupBy={(option) => option.option_group}
      getOptionLabel={(option) => option.symbol.props.name || "Unnamed symbol"}
      onChange={onChange}
      openOnFocus={true}
      blurOnSelect={true}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option.symbol.props.name || "", inputValue, {
          insideWords: true,
        });
        const parts = parse(option.symbol.props.name || "", matches);

        return (
          <Box
            component="li"
            sx={{ "& > svg": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            {getFontAwesomeIconForSymbolPreview(option.symbol.props, {
              size: defaultSymbolSizeForFormFields,
            })}
            {parts.map((part, index) => (
              <span
                key={index}
                style={{
                  fontWeight: part.highlight ? 700 : 400,
                }}
              >
                {part.text}
              </span>
            ))}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a symbol"
          InputProps={{
            ...params.InputProps,
            inputRef: ref,
            startAdornment:
              selectedSymbol !== undefined ? (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  {getFontAwesomeIconForSymbolPreview(selectedSymbol.props, {
                    size: defaultSymbolSizeForFormFields,
                  })}
                </InputAdornment>
              ) : undefined,
          }}
        />
      )}
    />
  );
}

export default forwardRef(SchemaSymbologyAutocomplete);
