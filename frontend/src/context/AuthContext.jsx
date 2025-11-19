import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  role: null,
  token: null,
  borrowerId: null,
  loginBorrower: () => {},
  loginAdmin: () => {},
  logout: () => {},
});

const getInitialState = () => {
  const token = localStorage.getItem("umeed_token");
  const role = localStorage.getItem("umeed_role");
  const borrowerId = localStorage.getItem("umeed_borrower_id");

  return {
    isLoggedIn: Boolean(token),
    token,
    role,
    borrowerId,
  };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialState);

  const loginBorrower = ({ token, borrowerId }) => {
    localStorage.setItem("umeed_token", token);
    localStorage.setItem("umeed_role", "borrower");
    localStorage.setItem("umeed_borrower_id", borrowerId);
    setAuthState({
      isLoggedIn: true,
      token,
      role: "borrower",
      borrowerId,
    });
  };

  const loginAdmin = ({ token }) => {
    localStorage.setItem("umeed_token", token);
    localStorage.setItem("umeed_role", "admin");
    localStorage.removeItem("umeed_borrower_id");
    setAuthState({
      isLoggedIn: true,
      token,
      role: "admin",
      borrowerId: null,
    });
  };

  const logout = () => {
    localStorage.removeItem("umeed_token");
    localStorage.removeItem("umeed_role");
    localStorage.removeItem("umeed_borrower_id");
    setAuthState({
      isLoggedIn: false,
      token: null,
      role: null,
      borrowerId: null,
    });
  };

  const value = useMemo(
    () => ({
      ...authState,
      loginBorrower,
      loginAdmin,
      logout,
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

