import {
  Autocomplete,
  Box,
  InputAdornment,
  TextField,
  createFilterOptions,
} from "@mui/material";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { forwardRef } from "react";
import {
  IconMetadata,
  getIconsMetadataByCategory,
} from "../ol_map/iconsMetadata";
import {
  getAppDefaultSymbologyConfig,
  getIconForSymbolForFormPreview,
  getOrderedIconCategories,
} from "./symbologyHelpers";

const getOptionsForAutocomplete = (): IconMetadata[] => {
  const iconsMetadataByCategory = getIconsMetadataByCategory();

  let options: IconMetadata[] = [];
  getOrderedIconCategories().forEach(
    (category) => (options = [...options, ...iconsMetadataByCategory[category]])
  );
  return options;
};

interface Props {
  selectedSymbol: IconMetadata | undefined;
  onChooseSymbol: (icon: string | null) => void;
}

function SymbologyIconAutocomplete(props: Props, ref: any) {
  console.log("### SymbologyIconAutocomplete ###");

  const { selectedSymbol, onChooseSymbol } = props;

  const onChange = (
    event: React.SyntheticEvent,
    value: IconMetadata | null
  ) => {
    // Allows the user to delete all of the text in the search box
    if (value !== null) {
      onChooseSymbol(value?.iconComponentName || null);
    }
  };

  return (
    <Autocomplete
      fullWidth
      sx={{ maxWidth: 350 }}
      options={getOptionsForAutocomplete()}
      value={selectedSymbol}
      isOptionEqualToValue={(option, value) =>
        value !== undefined &&
        option.iconComponentName === value.iconComponentName
      }
      filterOptions={createFilterOptions({
        stringify: (option) => `${option.iconComponentName} ${option.category}`,
      })}
      groupBy={(option) => option.category}
      getOptionLabel={(option) => option.iconComponentName}
      onChange={onChange}
      openOnFocus={true}
      blurOnSelect={true}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option.iconComponentName, inputValue, {
          insideWords: true,
        });
        const parts = parse(option.iconComponentName, matches);

        return (
          <Box
            component="li"
            sx={{ "& > svg": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            {getIconForSymbolForFormPreview(getAppDefaultSymbologyConfig(), {
              icon: option.iconComponentName,
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
          label="Icon"
          InputProps={{
            ...params.InputProps,
            inputRef: ref,
            startAdornment:
              selectedSymbol !== undefined ? (
                <InputAdornment position="start">
                  {getIconForSymbolForFormPreview(
                    getAppDefaultSymbologyConfig(),
                    { icon: selectedSymbol.iconComponentName }
                  )}
                </InputAdornment>
              ) : undefined,
          }}
        />
      )}
    />
  );
}

export default forwardRef(SymbologyIconAutocomplete);
