// import { LoadingButton } from "@mui/lab";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    Fade,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import React from "react";
import { forwardRef } from "react";
import { GrClose } from "react-icons/gr";
import { MdOutlineDelete } from "react-icons/md";

const Transition = forwardRef(function Transition(props, ref) {
    return <Fade ref={ref} {...props} />;
});

export const tableStyles = {
    "& .MuiDataGrid-cellContent": {
        wordBreak: "break-word",
        whiteSpace: "break-spaces",
        paddingY: 1.5,
    },
    "& .MuiDataGrid-columnHeaders": {
        bgcolor: "#a64143",
        borderRadius: 2,
        color: "white",
    },
    "& .MuiDataGrid-iconSeparator": {
        display: "none",
    },
    "& .MuiDataGrid-MuiFormControl-root-MuiTextField-root-MuiDataGrid-toolbarQuickFilter":
    {
        display: "none",
    },
    "& .MuiDataGrid-cell": {
        borderBottom: "none",
        paddingY: 1.5,
    },
    "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within, .MuiDataGrid-cell:focus":
    {
        outline: "none !important",
    },
};


function ConfirmBox({
    name,
    title,
    toDoFunction,
    closeDialog,
    open,
    loading,
}) {
    return (
        <Dialog
            fullWidth
            open={open}
            maxWidth="md"
            scroll="body"
            onClose={closeDialog}
            onBackdropClick={closeDialog}
            TransitionComponent={Transition}
        >
            <DialogContent
                sx={{
                    px: { xs: 2, sm: 4.5 },
                    py: { xs: 2, sm: 4 },
                    position: "relative",
                }}
            >
                <IconButton
                    size="small"
                    onClick={closeDialog}
                    sx={{ position: "absolute", right: "1rem", top: "1rem" }}
                >
                    <GrClose />
                </IconButton>

                <Grid container spacing={6}>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                mb: 3,
                                display: "flex",
                                justifyContent: "flex-start",
                                flexDirection: "column",
                            }}
                        >
                            <Typography variant="h4" sx={{ mb: 3, lineHeight: "2rem" }}>
                                Delete {title}
                            </Typography>
                            <Typography variant="body1">
                                Are You Sure you want to delete this {name} ?
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                        <button
                            onClick={closeDialog}
                            className=" text-white font-small justify-center w-[6rem] bg-[#0066FF] rounded-lg py-3 flex mx-2 items-center transition transform active:scale-95 duration-200  "
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={toDoFunction}
                            disabled={loading}
                            className="flex text-white font-small justify-center items-center w-[8rem] bg-[#d32f2f] rounded-lg py-3 mx-2 transition transform active:scale-95 duration-200  "
                        >
                            {loading ? (
                                <CircularProgress size={20} sx={{ mr: 2 }} color="inherit" />
                            ) : (
                                <MdOutlineDelete />
                            )}
                            DELETE
                        </button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}

export default ConfirmBox;
