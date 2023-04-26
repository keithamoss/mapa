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
  IFontAwesomeIconsByCategory,
  getIconByNameWithFirstCategory,
  getIconsSortedByCategory,
} from "./font-awesome/fontAwesome";
import { getFontAwesomeIconFromLibrary } from "./symbologyHelpers";

interface Props {
  selectedSymbol: string | undefined;
  onChooseSymbol: (icon: string | null) => void;
}

function SymbologyIconAutocomplete(props: Props, ref: any) {
  console.log("### SymbologyIconAutocomplete ###");

  const { selectedSymbol, onChooseSymbol } = props;

  const onChange = (
    event: React.SyntheticEvent,
    value: IFontAwesomeIconsByCategory | null
  ) => {
    // Allows the user to delete all of the text in the search box
    if (value !== null) {
      onChooseSymbol(value.icon.name || null);
    }
  };

  return (
    <Autocomplete
      fullWidth
      sx={{ maxWidth: 350 }}
      options={getIconsSortedByCategory()}
      value={
        selectedSymbol !== undefined
          ? getIconByNameWithFirstCategory(selectedSymbol)
          : undefined
      }
      isOptionEqualToValue={(option, value) =>
        value !== undefined && option.icon.name === value.icon.name
      }
      filterOptions={createFilterOptions({
        stringify: (option) =>
          `${option.icon.label} ${
            option.category.label
          } ${option.icon.search.terms.join(" ")}`,
      })}
      groupBy={(option) => option.category.label}
      getOptionLabel={(option) => option.icon.label}
      onChange={onChange}
      openOnFocus={true}
      blurOnSelect={true}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option.icon.label, inputValue, {
          insideWords: true,
        });
        const parts = parse(option.icon.label, matches);

        return (
          <Box
            component="li"
            sx={{ "& > svg": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            {getFontAwesomeIconFromLibrary(option.icon.name)}
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
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  {getFontAwesomeIconFromLibrary(selectedSymbol)}
                </InputAdornment>
              ) : undefined,
          }}
        />
      )}
    />
  );
}

export default forwardRef(SymbologyIconAutocomplete);
