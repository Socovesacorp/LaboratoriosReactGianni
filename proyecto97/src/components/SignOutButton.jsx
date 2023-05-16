import React from "react";
import { useMsal } from "@azure/msal-react";
import { Button} from 'react-bootstrap';

/**
 * Renders a sign out button 
 */
export const SignOutButton = () => {
  const { instance } = useMsal();

  const handleLogout = (logoutType) => {
    if (logoutType === "popup") {
      instance.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/",
      });
    } else if (logoutType === "redirect") {
      instance.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
    }
  };

  return (
    <Button variant="secondary" onClick={() => handleLogout("redirect")}>
      Cerrar Sesion
    </Button>      
  );
};