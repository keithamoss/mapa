import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
  Avatar,
  Box,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Paper,
  Typography,
} from "@mui/material";

import { useState } from "react";
import { getFontAwesomeIconFromLibraryAsSVGImage } from "./symbologyHelpers";

import { grey } from "@mui/material/colors";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import React from "react";
import { usePrevious } from "../../app/hooks/usePrevious";
import { DialogWithTransition } from "../../app/ui/dialog";
import "./colourPicker.css";
import {
  IconFamilyStyle,
  getCategoriesForIcon,
  getCategoriesMetadata,
  getCategoryLabelByName,
  getIconAvailableStyles,
  getIconFamilyAndStyleName,
  getIconLabelByName,
  getIconsBySearchTermAndMaybeCategory,
  getIconsForCategory,
} from "./font-awesome/fontAwesome";

const enum IconChooserPage {
  AllCategories,
  IconsInCategory,
  IconSearchResults,
  IconFamilyAndStyleChooser,
}

interface Props {
  selectedIcon?: string;
  selectedIconFamily?: string;
  selectedIconStyle?: string;
  openAtFamilyAndStyleChooser: boolean;
  onChoose: (icon: string, icon_family: string, icon_style: string) => void;
  onClose: () => void;
}

function SymbologyIconChooser(props: Props) {
  console.log("### SymbologyIconChooser ###");

  const {
    selectedIcon,
    selectedIconFamily,
    selectedIconStyle,
    openAtFamilyAndStyleChooser,
    onChoose,
    onClose,
  } = props;

  const [selectedPage, setSelectedPage] = useState(
    openAtFamilyAndStyleChooser === true
      ? IconChooserPage.IconFamilyAndStyleChooser
      : IconChooserPage.AllCategories
  );

  const previousSelectedPage = usePrevious(selectedPage);

  const navigateToPreviousPage = () => {
    if (previousSelectedPage !== undefined) {
      setSelectedPage(previousSelectedPage);
    } else {
      setSelectedPage(IconChooserPage.AllCategories);
    }
  };

  // ######################
  // Icon Searching
  // ######################
  const [iconSearchFieldValue, setIconSearchFieldValue] = useState("");

  const [iconSearchTerm, setIconSearchTerm] = useState("");

  const onIconSearchInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setIconSearchFieldValue(event.target.value);
    setIconChosen(undefined);

    if (event.target.value.length >= 3) {
      setIconSearchTerm(event.target.value);
      setSelectedPage(IconChooserPage.IconSearchResults);
    } else if (event.target.value.length === 0) {
      setIconSearchTerm("");
      setSelectedPage(IconChooserPage.IconSearchResults);
    }
  };

  const onClearIconSearchInput = () => {
    setIconSearchFieldValue("");
    setIconSearchTerm("");
    navigateToPreviousPage();
  };
  // ######################
  // Icon Searching (End)
  // ######################

  // ######################
  // Icon Categories
  // ######################
  const [chosenIconCategory, setChosenIconCategory] = useState<
    string | undefined
  >(undefined);

  const onChooseIconCategory = (categoryName: string) => () => {
    setChosenIconCategory(categoryName);
    setSelectedPage(IconChooserPage.IconsInCategory);
  };

  const onChooseIconCategoryFromQuickLinks = (categoryName: string) => () => {
    setIconChosen(undefined);
    setChosenIconCategory(categoryName);
    setSelectedPage(IconChooserPage.IconsInCategory);
  };

  const onChooseNavigateToAllCategories = () => () => {
    setChosenIconCategory(undefined);
    setIconSearchTerm("");
    setSelectedPage(IconChooserPage.AllCategories);
  };
  // ######################
  // Icon Categories (End)
  // ######################

  // ######################
  // Icon Choosing
  // ######################
  const [iconChosen, setIconChosen] = useState<string | undefined>(
    selectedIcon !== undefined ? selectedIcon : undefined
  );

  const onChooseIcon = (iconName: string) => () => {
    setIconChosen(iconName);
    setSelectedPage(IconChooserPage.IconFamilyAndStyleChooser);
  };

  const onChooseIconFamilyAndStyleFromIconChoosingPath =
    (familyStyle: IconFamilyStyle) => () => {
      if (iconChosen !== undefined) {
        setChosenIconCategory(undefined);
        setIconSearchTerm("");
        setIconChosen(undefined);

        onChoose(iconChosen, familyStyle.family, familyStyle.style);
      }
    };
  // ######################
  // Icon Choosing (End)
  // ######################

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
          {/* 
          ############################################
          Icon search bar
          ############################################
          */}
          <FormControl variant="outlined" fullWidth>
            <InputLabel>
              {chosenIconCategory === undefined
                ? "Search for an icon"
                : `Search for an icon in ${getCategoryLabelByName(
                    chosenIconCategory
                  )}`}
            </InputLabel>
            <OutlinedInput
              label={
                chosenIconCategory === undefined
                  ? "Search for an icon"
                  : `Search for an icon in ${getCategoryLabelByName(
                      chosenIconCategory
                    )}`
              }
              onChange={onIconSearchInputChange}
              value={iconSearchFieldValue}
              endAdornment={
                iconSearchTerm.length > 0 ? (
                  <CloseIcon
                    sx={{ color: grey[500] }}
                    onClick={onClearIconSearchInput}
                  />
                ) : null
              }
              sx={{ mb: 1 }}
            />
          </FormControl>

          {/* 
          ############################################
          Display the available icon categories
          ############################################
          */}
          {selectedPage === IconChooserPage.AllCategories && (
            <List
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "background.paper",
              }}
            >
              {getCategoriesMetadata().map((category) => (
                <ListItem key={category.name} disablePadding>
                  <ListItemButton onClick={onChooseIconCategory(category.name)}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: grey[50],
                          width: "45px",
                          height: "45px",
                          "& > img": { width: 25, height: 25 },
                        }}
                      >
                        {getFontAwesomeIconFromLibraryAsSVGImage(category.icon)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={category.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {/* 
          ############################################
          Display the icons within your chosen category
          ############################################
          */}
          {selectedPage === IconChooserPage.IconsInCategory &&
            chosenIconCategory !== undefined && (
              <React.Fragment>
                {/* Flexbox wrapping a row flex in a column flex appears to be the only way to use Flexbox to take up all vertical *and* horizontal space. Other recommendations were to use CSS Grid or - maybe - wait until MUI takes their Grid 2 component out of beta. */}
                <Grid container direction="column" sx={{ mt: 1, mb: 2 }}>
                  <Grid container direction="row" alignItems="center">
                    {/* <Grid item>
                    <Avatar
                      sx={{
                        bgcolor: grey[50],
                        width: "45px",
                        height: "45px",
                        "& > img": { width: 25, height: 25 },
                      }}
                    >
                      <CategoryOutlinedIcon />
                    </Avatar>
                  </Grid> */}
                    <Grid item>
                      <CategoryOutlinedIcon sx={{ verticalAlign: "middle" }} />
                    </Grid>
                    <Grid item sx={{ mr: 1, flexGrow: 1 }}>
                      <Link
                        component="button"
                        variant="body2"
                        sx={{ pl: 1 }}
                        onClick={onChooseNavigateToAllCategories()}
                      >
                        All Categories
                      </Link>
                    </Grid>
                    {/* <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={onGoBackFromIconFamilyAndStyleChooser}
                    >
                      Back
                    </Button>
                  </Grid> */}
                  </Grid>
                </Grid>

                {/* Flexbox wrapping a row flex in a column flex appears to be the only way to use Flexbox to take up all vertical *and* horizontal space. Other recommendations were to use CSS Grid or - maybe - wait until MUI takes their Grid 2 component out of beta. */}
                <Grid container direction="column" sx={{ mt: 1 }}>
                  <Grid container direction="row" alignItems="center">
                    {/* <Grid item>
                      <CategoryOutlinedIcon />
                    </Grid> */}
                    <Grid item sx={{ ml: 1, flexGrow: 1 }}>
                      <Typography variant="h6">
                        {getCategoryLabelByName(chosenIconCategory)}
                      </Typography>
                    </Grid>
                    {/* <Grid item>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onCloseIconCategory}
                      >
                        Back
                      </Button>
                    </Grid> */}
                  </Grid>
                </Grid>

                <List
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                  }}
                >
                  {getIconsForCategory(chosenIconCategory).map((icon) => (
                    <ListItem key={icon.name} disablePadding>
                      <ListItemButton onClick={onChooseIcon(icon.name)}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: grey[50],
                              width: "45px",
                              height: "45px",
                              "& > img": { width: 25, height: 25 },
                            }}
                          >
                            {getFontAwesomeIconFromLibraryAsSVGImage(icon.name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={icon.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </React.Fragment>
            )}

          {/* 
          ############################################
          Choose from the available styles for an icon
          ############################################
          */}
          {selectedPage === IconChooserPage.IconFamilyAndStyleChooser &&
            iconChosen !== undefined && (
              <React.Fragment>
                {/* <ButtonGroup variant="contained">
                <Button>One</Button>
                <Button>Two</Button>
                <Button>Three</Button>
                <Button>Four</Button>
                <Button>Five</Button>
                <Button>Six</Button>
                <Button>Seven</Button>
                <Button>Eight</Button>
              </ButtonGroup>

              <ButtonGroup variant="contained">
                {getCategoriesForIcon(iconChosen).map(
                  (categoryName: string) => (
                    <Button>{categoryName}</Button>
                  )
                )}
              </ButtonGroup> */}

                {/* Flexbox wrapping a row flex in a column flex appears to be the only way to use Flexbox to take up all vertical *and* horizontal space. Other recommendations were to use CSS Grid or - maybe - wait until MUI takes their Grid 2 component out of beta. */}
                <Grid container direction="column" sx={{ mt: 1 }}>
                  <Grid container direction="row" alignItems="center">
                    {/* <Grid item>
                    <Avatar
                      sx={{
                        bgcolor: grey[50],
                        width: "45px",
                        height: "45px",
                        "& > img": { width: 25, height: 25 },
                      }}
                    >
                      <CategoryOutlinedIcon />
                    </Avatar>
                  </Grid> */}
                    <Grid item>
                      <CategoryOutlinedIcon sx={{ verticalAlign: "middle" }} />
                    </Grid>
                    <Grid item sx={{ mr: 1, flexGrow: 1 }}>
                      <Link
                        component="button"
                        variant="body2"
                        sx={{ pl: 1 }}
                        onClick={onChooseNavigateToAllCategories()}
                      >
                        All Categories
                      </Link>
                      {getCategoriesForIcon(iconChosen).map((category) => (
                        <Link
                          key={category.name}
                          component="button"
                          variant="body2"
                          sx={{ pl: 1 }}
                          onClick={onChooseIconCategoryFromQuickLinks(
                            category.name
                          )}
                        >
                          {category.label}
                        </Link>
                      ))}
                    </Grid>
                    {/* <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={onGoBackFromIconFamilyAndStyleChooser}
                    >
                      Back
                    </Button>
                  </Grid> */}
                  </Grid>
                </Grid>

                {/* Flexbox wrapping a row flex in a column flex appears to be the only way to use Flexbox to take up all vertical *and* horizontal space. Other recommendations were to use CSS Grid or - maybe - wait until MUI takes their Grid 2 component out of beta. */}
                <Grid container direction="column" sx={{ mt: 1 }}>
                  <Grid container direction="row" alignItems="center">
                    {/* <Grid item>
                    <Avatar
                      sx={{
                        bgcolor: grey[50],
                        width: "45px",
                        height: "45px",
                        "& > img": { width: 25, height: 25 },
                      }}
                    >
                      {getFontAwesomeIconFromLibraryAsSVGImage(iconChosen)}
                    </Avatar>
                  </Grid> */}
                    <Grid item sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {getIconLabelByName(iconChosen)}
                      </Typography>
                    </Grid>
                    {/* <Grid item>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onGoBackFromIconFamilyAndStyleChooser}
                      >
                        Back
                      </Button>
                    </Grid> */}
                  </Grid>
                </Grid>

                <Box sx={{ width: "100%" }}>
                  <Grid container spacing={1}>
                    {getIconAvailableStyles(iconChosen).map(
                      (familyStyle, index) => {
                        return (
                          <Grid
                            key={`${familyStyle.family}_${familyStyle.style}`}
                            item
                            xs={6}
                            sx={{
                              //   Avoid padding on the first column so elements aren't offset a wee bit too much to the right on this two column layout
                              pl:
                                index % 2 === 0
                                  ? "0 !important"
                                  : "1 !important",
                            }}
                            onClick={onChooseIconFamilyAndStyleFromIconChoosingPath(
                              familyStyle
                            )}
                          >
                            <Paper
                              // variant="outlined"
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
                                  iconChosen,
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
              </React.Fragment>
            )}

          {/* 
          ############################################
          Choose from the available styles for an icon
          (List-based variant.)
          ############################################
          */}
          {/* {showAvailableStylesForChosenIcon === true && (
            <List
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "background.paper",
              }}
            >
              {getIconAvailableStyles(iconChosen).map((familyStyle) => {
                return (
                  <ListItem
                    key={`${familyStyle.family}_${familyStyle.style}`}
                    disablePadding
                  >
                    <ListItemButton
                    // onClick={onChooseIcon(icon.name)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: grey[50],
                            width: "45px",
                            height: "45px",
                            "& > img": { width: 25, height: 25 },
                          }}
                        >
                          {getFontAwesomeIconFromLibraryAsSVGImage(
                            iconChosen,
                            familyStyle.family,
                            familyStyle.style
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={getIconFamilyAndStyleName(
                          familyStyle.family,
                          familyStyle.style
                        )}
                      ></ListItemText>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )} */}

          {/* 
          ############################################
          Choose from the available styles for an icon
          (ImageList-based variant.)
          ############################################
          */}
          {/* {showAvailableStylesForChosenIcon === true && (
            <ImageList gap={8}>
              {getIconAvailableStyles(iconChosen).map((familyStyle) => (
                <ImageListItem
                  key={`${familyStyle.family}_${familyStyle.style}`}
                  onClick={onChooseIconFamilyAndStyle(
                    familyStyle.family,
                    familyStyle.style
                  )}
                  sx={{
                    backgroundColor: grey[50],
                    height: "100px !important",
                    "& > img": {
                      maxWidth: 100,
                      maxHeight: 100,
                      width: "60px !important",
                      height: "60px !important",
                      objectFit: "contain !important",
                      position: "relative !important",
                      left: "36px !important",
                      top: "-3px !important",
                    },
                  }}
                >
                  {getFontAwesomeIconFromLibraryAsSVGImage(
                    icon!,
                    familyStyle.family,
                    familyStyle.style
                  )}
                  <ImageListItemBar
                    subtitle={getIconFamilyAndStyleName(
                      familyStyle.family,
                      familyStyle.style
                    )}
                    sx={{
                      backgroundColor: "white",
                      "& > div": { pt: "6px", pb: "6px", pl: "4px", pr: "8px" },
                    }}
                    position="below"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )} */}

          {/* 
          ############################################
          Display the icon search results
          ############################################
          */}
          {selectedPage === IconChooserPage.IconSearchResults && (
            <List
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "background.paper",
              }}
            >
              {getIconsBySearchTermAndMaybeCategory(
                iconSearchTerm,
                chosenIconCategory
              ).map((icon) => {
                const matches = match(icon.label, iconSearchTerm, {
                  insideWords: true,
                });
                const parts = parse(icon.label, matches);

                return (
                  <ListItem key={icon.name} disablePadding>
                    <ListItemButton onClick={onChooseIcon(icon.name)}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: grey[50],
                            width: "45px",
                            height: "45px",
                            "& > img": { width: 25, height: 25 },
                          }}
                        >
                          {getFontAwesomeIconFromLibraryAsSVGImage(icon.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <span>
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
                          </span>
                        }
                      ></ListItemText>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}

          {/* 
          ############################################
          Display the icon search results
          (Paper-based variant.)
          ############################################
          */}
          {/* {showIconSearchResults === true && (
            <Box sx={{ width: "100%" }}>
              <Grid container spacing={1}>
                {getIconsBySearchTermAndMaybeCategory(iconSearchTerm).map((icon) => {
                  const matches = match(icon.label, iconSearchTerm, {
                    insideWords: true,
                  });
                  const parts = parse(icon.label, matches);

                  return (
                    <Grid key={icon.name} item xs={6}>
                      <Paper
                        // variant="outlined"
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
                          {getFontAwesomeIconFromLibraryAsSVGImage(icon.name)}
                        </Box>

                        <Typography
                          variant="subtitle2"
                          sx={{ textAlign: "center" }}
                        >
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
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )} */}
        </Paper>
      </DialogWithTransition>
    </React.Fragment>
  );
}

export default SymbologyIconChooser;
