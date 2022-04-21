import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BlockNative,  NumStaked,  TEDR,  Balance,  PR,  NFTsToBeStakedOrUnstaked} from "./staking"

const account = ReactDOM.createRoot(document.getElementById('account'));
account.render(
  <React.StrictMode>
    <BlockNative />
  </React.StrictMode>
);

const noStaked = ReactDOM.createRoot(document.getElementById('noStaked'));
noStaked.render(
  <React.StrictMode>
    <NumStaked />
  </React.StrictMode>
);

const totalExpectedDailyReturn = ReactDOM.createRoot(document.getElementById('totalExpectedDailyReturn'));
totalExpectedDailyReturn.render(
  <React.StrictMode>
    <TEDR />
  </React.StrictMode>
);

const bal = ReactDOM.createRoot(document.getElementById('bal'));
bal.render(
  <React.StrictMode>
    <Balance />
  </React.StrictMode>
);

const noOfTroops = ReactDOM.createRoot(document.getElementById('noOfTroops'));
noOfTroops.render(
  <React.StrictMode>
    <NumOfTroops />
  </React.StrictMode>
);

const pendingRewards= ReactDOM.createRoot(document.getElementById('pendingRewards'));
pendingRewards.render(
  <React.StrictMode>
    <PR />
  </React.StrictMode>
);

const NFTs= ReactDOM.createRoot(document.getElementById('NFTs'));
NFTs.render(
  <React.StrictMode>
    <NFTsToBeStakedOrUnstaked />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
