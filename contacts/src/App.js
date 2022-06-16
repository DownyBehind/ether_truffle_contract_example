import { useEffect, useState } from "react";
import Web3 from "web3";
import {
  CONTACT_ABI,
  CONTACT_ADDRESS,
  NFT_ABI,
  NFT_ADDRESS,
  ERC20WithAutoMinerReward_ABI,
  ERC20WithAutoMinerReward_ADDRESS,
} from "./config";

function App() {
  const [account, setAccount] = useState();
  const [contactList, setContactList] = useState();
  const [contacts, setContacts] = useState([]);

  const [nftList, setNftList] = useState();
  const [nftTokenId, setNftTokenId] = useState();

  const [erc20List, setErc20List] = useState();

  useEffect(() => {
    async function load() {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
      const NFT = new web3.eth.Contract(NFT_ABI, NFT_ADDRESS);
      const ERC20 = new web3.eth.Contract(
        ERC20WithAutoMinerReward_ABI,
        ERC20WithAutoMinerReward_ADDRESS
      );

      setContactList(contactList);
      setNftList(NFT);
      setErc20List(ERC20);

      const counter = await contactList.methods.count().call();

      for (var i = 1; i <= counter; i++) {
        const contact = await contactList.methods.contacts(i).call();
        setContacts((contacts) => [...contacts, contact]);
      }
      //   console.log(newNFTId);
    }

    load();
  }, []);
  return (
    <div>
      Your account is: {account}
      <h1>Contacts</h1>
      <ul>
        {Object.keys(contacts).map((contact, index) => (
          <li key={`${contacts[index].name}-${index}`}>
            <h4>{contacts[index].name}</h4>
            <span>
              <b>Phone: </b>
              {contacts[index].phone}
            </span>
          </li>
        ))}
        <button
          onClick={async () => {
            var newNFTId = await nftList.methods
              .awardItem(
                account,
                "https://gateway.pinata.cloud/ipfs/QmX7R18qGCmAWgXR1dRcJ8Sf6LnFJFWpmZ1eRDXBC6vXnw"
              )
              .call()
              .then(console.log);

            setNftTokenId(newNFTId);
          }}
        >
          클릭 시 NFT 발행
        </button>
        <div>{nftTokenId}</div>
      </ul>
    </div>
  );
}

export default App;
