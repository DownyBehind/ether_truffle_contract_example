import userEvent from "@testing-library/user-event";
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
const { BigNumber } = require("@ethersproject/bignumber");

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  "45ebfb6f3ccf08d5f06d",
  "5dbc48b2f862e552f77df7c732acd0122bdc69541e59b2b459352b626b3dc924"
);

function App() {
  const [account, setAccount] = useState();
  const [contactList, setContactList] = useState();
  const [contacts, setContacts] = useState([]);

  const [nftList, setNftList] = useState();
  const [nftTokenId, setNftTokenId] = useState();
  const [nftUrl, setNftUrl] = useState();
  const [nftName, setNftName] = useState();
  const [nftDescription, setNftDescription] = useState();
  const [nftImage, setNftImage] = useState();

  const [erc20List, setErc20List] = useState();
  const [erc20Balance, setErc20Balance] = useState();

  const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

  useEffect(() => {
    async function load() {
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
    }

    load();
  }, []);

  function genIpfsUrl() {
    const nftName = "CodeSnaker";
    const description = "This is Reward";
    const imageLocation =
      "https://e1.pngegg.com/pngimages/298/527/png-clipart-snoopy.png";
    const fs = require("fs");

    const json = `{"name":"${nftName}","description":"${description}","image":"${imageLocation}","attributes":[{"trait_type": "Unknown","value": "Unknown"}]}`;

    fs.writeFile(`json/dummy.json`, json, "utf8", (e) => e);

    const readableStreamForFile = fs.createReadStream(`json/dummy.json`);

    pinata
      .pinFileToIPFS(readableStreamForFile)
      .then((result) => {
        //handle results here
        console.log(result);
        console.log(result.IpfsHash);

        const tokenUri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        console.log(tokenUri);
      })
      .catch((err) => {
        //handle error here
        console.log(err);
      });
  } // node 서버에서 수행 가능, browser에서는 수행 불가

  async function getDate() {
    const tokenUrl = await nftList.methods.tokenURI(nftTokenId).call();
    setNftUrl(tokenUrl);
    const data = await fetch(tokenUrl);
    const json = await data.json();
    console.log(json);

    setNftName(json.name);
    setNftDescription(json.description);
    setNftImage(json.image);
    console.log(tokenUrl);
  } // nft token url 조회

  async function mintNft() {
    try {
      const newNFTId = await nftList.methods
        .awardItem(
          account,
          "https://gateway.pinata.cloud/ipfs/QmRJFfZzCFsnmNgFrM3kKacujE2vovThJbXyjqczxkKLHV"
        )
        .send({ from: account });

      console.log(newNFTId.events.Transfer.returnValues.tokenId);

      setNftTokenId(newNFTId.events.Transfer.returnValues.tokenId);
    } catch (err) {
      console.log(err);
    }
  } // nft 발행

  async function getMyToken() {
    const myTokenBalance = await erc20List.methods.balanceOf(account).call();
    console.log(myTokenBalance);
    setErc20Balance(myTokenBalance);
  }

  async function userErc20Token(address) {
    const userErc20Token = await erc20List.methods.balanceOf(address).call();
    console.log(userErc20Token);
  }

  async function transferErc20Token() {
    const address = "0x74476Eff9faE2AD39f6FBf32D2E6694eCc197629";
    const amount = BigNumber.from("10000000000000000000");

    const transfer = await erc20List.methods
      .transfer(address, amount)
      .send({ from: account });
    console.log(transfer);
  }

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
        <button onClick={genIpfsUrl}>클릭 시 NFT json 생성</button>
        <button onClick={mintNft}>클릭 시 NFT 발행</button>
        <div>{nftTokenId}</div>
        <button onClick={getDate}>클릭 시 NFT 내역 조회</button>
        <div>name : {nftName}</div>
        <div>description : {nftDescription}</div>
        <div>image : {nftImage}</div>
        <img src={nftImage} />
        <button onClick={getMyToken}>내 ERC20 토큰 내역 조회</button>
        <div>내 ERC20 토큰 갯수 : {erc20Balance}</div>
        <button onClick={transferErc20Token}>ERC20 송금하기</button>
      </ul>
    </div>
  );
}

export default App;
