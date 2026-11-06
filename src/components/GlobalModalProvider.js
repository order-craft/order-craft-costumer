import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import GlobalModal from "./GlobalModal";

const GlobalModalContext = createContext(null);

export const GlobalModalProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((value) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    if (typeof r === "function") r(value);
  }, []);

  const open = useCallback((next) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState(next);
    });
  }, []);

  const info = useCallback(
    ({ title, message, subtitle, okLabel }) =>
      open({
        kind: "info",
        tone: "info",
        title: title || "Notice",
        subtitle,
        message,
        okLabel,
      }),
    [open],
  );

  const success = useCallback(
    ({ title, message, subtitle, okLabel }) =>
      open({
        kind: "info",
        tone: "success",
        title: title || "Done",
        subtitle,
        message,
        okLabel,
      }),
    [open],
  );

  const error = useCallback(
    ({ title, message, subtitle, okLabel }) =>
      open({
        kind: "error",
        tone: "error",
        title: title || "Something went wrong",
        subtitle,
        message,
        okLabel,
      }),
    [open],
  );

  const confirm = useCallback(
    ({
      title,
      message,
      subtitle,
      confirmLabel,
      cancelLabel,
      confirmTone = "primary",
    }) =>
      open({
        kind: "confirm",
        tone: confirmTone === "danger" ? "error" : "info",
        title: title || "Are you sure?",
        subtitle,
        message,
        confirmLabel,
        cancelLabel,
        confirmTone,
      }),
    [open],
  );

  // Memoize the context value so consumers don't see a new object on
  // every provider render. This is what lets us safely add `modal` to
  // useEffect deps in consumer components.
  const value = { info, success, error, confirm };
  return (
    <GlobalModalContext.Provider value={value}>
      {children}
      <GlobalModal state={state} onResolve={close} />
    </GlobalModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const ctx = useContext(GlobalModalContext);
  if (!ctx) {
    throw new Error("useGlobalModal must be used inside GlobalModalProvider");
  }
  return ctx;
};
