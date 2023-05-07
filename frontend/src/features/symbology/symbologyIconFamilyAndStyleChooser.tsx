import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";

import { getFontAwesomeIconFromLibraryAsSVGImage } from "./symbologyHelpers";

import React from "react";
import { DialogWithTransition } from "../../app/ui/dialog";
import {
  IconFamilyStyle,
  getIconAvailableStyles,
  getIconFamilyAndStyleName,
  getIconLabelByName,
} from "./font-awesome/fontAwesome";

interface Props {
  selectedIcon: string;
  onChoose: (icon_family: string, icon_style: string) => void;
  onClose: () => void;
}

function SymbologyIconFamilyAndStyleChooser(props: Props) {
  console.log("### SymbologyIconFamilyAndStyleChooser ###");

  const { selectedIcon, onChoose, onClose } = props;

  const onChooseIconFamilyAndStyle = (familyStyle: IconFamilyStyle) => () => {
    onChoose(familyStyle.family, familyStyle.style);
  };

  return (
    <React.Fragment>
      <DialogWithTransition>
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
          {/* Flexbox wrapping a row flex in a column flex appears to be the only way to use Flexbox to take up all vertical *and* horizontal space. Other recommendations were to use CSS Grid or - maybe - wait until MUI takes their Grid 2 component out of beta. */}
          <Grid container direction="column" sx={{ mt: 1 }}>
            <Grid container direction="row" alignItems="center">
              <Grid item sx={{ flexGrow: 1 }}>
                <Typography variant="h6">
                  {getIconLabelByName(selectedIcon)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ width: "100%" }}>
            <Grid container spacing={1}>
              {getIconAvailableStyles(selectedIcon).map(
                (familyStyle, index) => {
                  return (
                    <Grid
                      key={`${familyStyle.family}_${familyStyle.style}`}
                      item
                      xs={6}
                      sx={{
                        //   Avoid padding on the first column so elements aren't offset a wee bit too much to the right on this two column layout
                        pl: index % 2 === 0 ? "0 !important" : "1 !important",
                      }}
                      onClick={onChooseIconFamilyAndStyle(familyStyle)}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 1,
                          minHeight: "116px",
                        }}
                      >
                        <Box
                          sx={{
                            pb: 1,
                            "& > img": {
                              height: 40,
                              width: 40,
                            },
                          }}
                        >
                          {getFontAwesomeIconFromLibraryAsSVGImage(
                            selectedIcon,
                            familyStyle.family,
                            familyStyle.style
                          )}
                        </Box>

                        <Typography
                          variant="subtitle2"
                          sx={{ textAlign: "center" }}
                        >
                          {getIconFamilyAndStyleName(
                            familyStyle.family,
                            familyStyle.style
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                }
              )}
            </Grid>
          </Box>
        </Paper>
      </DialogWithTransition>
    </React.Fragment>
  );
}

export default SymbologyIconFamilyAndStyleChooser;
