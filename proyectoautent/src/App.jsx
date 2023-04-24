import React, { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import Button from 'react-bootstrap/Button';
import { PageLayout } from './components/PageLayout';
import { loginRequest } from './authConfig';
import { callMsGraph } from './graph';
import { ProfileData } from './components/ProfileData';
import MenuG from './MenuG';

import './App.css';

const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);
  const [showMenuG, setShowMenuG] = useState(false);

  const handleProfileDataRequest = () => {
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        callMsGraph(response.accessToken).then((response) => setGraphData(response));
      });
  }

  const handleMenuGClick = () => {
    setShowMenuG(true);
  }

  if (!showMenuG) {
    return (
      <>
        <h5 className="card-title">Welcome {accounts[0].name}</h5>
        <br />
        {graphData ? (
          <ProfileData graphData={graphData} />
        ) : (
          <>
            <Button variant="secondary" onClick={handleProfileDataRequest}>
              Request Profile Information
            </Button>

          </>
        )}
      </>
    );
  }

  return <MenuG />;
};


export default function App() {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);
  const [showMenuG, setShowMenuG] = useState(false);

  const handleProfileDataRequest = () => {
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        callMsGraph(response.accessToken).then((response) => setGraphData(response));
      });
  }

  const handleMenuGClick = () => {
    setShowMenuG(true);
  }

  if (showMenuG) {
    return <MenuG />;
  }

  return (
    <PageLayout>
      <center>
        <div className="App">
          <AuthenticatedTemplate>
            <ProfileContent />

            {graphData ? (
              <ProfileData graphData={graphData} />
            ) : (
              <>
                <Button variant="secondary" onClick={handleProfileDataRequest}>
                  Request Profile Information
                </Button>
                <Button variant="secondary" onClick={handleMenuGClick}>
                  Show MenuG1
                </Button>
              </>
            )}
          </AuthenticatedTemplate>

          <UnauthenticatedTemplate>
            <h5>
              <center>Please sign-in to see your profile information.</center>
            </h5>
          </UnauthenticatedTemplate>
        </div>
      </center>
    </PageLayout>
  );
}
