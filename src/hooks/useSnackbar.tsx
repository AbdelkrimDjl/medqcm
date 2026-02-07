import { useSnackbar as usk } from "notistack";

export const useSnackbar = () => {
  const { enqueueSnackbar } = usk();

  return {
    error: (msg: string) => enqueueSnackbar(msg, { variant: "error" }),
    success: (msg: string) => enqueueSnackbar(msg, { variant: "success" }),
    warning: (msg: string) => enqueueSnackbar(msg, { variant: "warning" }),
  };
};
