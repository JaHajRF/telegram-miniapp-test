import { useEffect, useState } from 'react';
import './NFTItem.css';
import axios from 'axios';
import { NFTItemAttributes } from './NFTItem.types';
import { createTransferRequest, getIpfsGatewayUrl } from '../utils';
import { CHAIN, useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

const NFTItem = ({myNFTsContentUrl, nftAddress, myAddress}: { myNFTsContentUrl: string, nftAddress: Address, myAddress: string}) => {
    const [nftItem, setNftItem] = useState<NFTItemAttributes>()
    const [receiverAddress, setReceiverAddress] = useState<string>('')
    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        axios.get<NFTItemAttributes>(myNFTsContentUrl).then(response => {
            if(response && response.data) {
                setNftItem(response.data)
            }
        })
    }, [])
    if(!nftItem) {
        return (
            <div>Loading...</div>
        )
    }
    const imgUrl = getIpfsGatewayUrl(nftItem.image)
    
    const sendTransaction = () => {
        const sendNFTRequest = createTransferRequest(CHAIN.TESTNET, nftAddress.toString(), myAddress, receiverAddress)
        tonConnectUI.sendTransaction(sendNFTRequest).then(response => console.log('RESPONSE', response))
    }
  return (
          <div className='NFTContainer'>
                <div className='descriptionContainer'>
                    <b className='nftText'>Name: {nftItem.name}</b>
                    <b className='nftText'>Description: {nftItem.description}</b>
                </div>
              <img className='nftImage' src={imgUrl} alt="" />
              <div className=''>
                <input type='text' placeholder='Wallet address' value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} />
                <button onClick={sendTransaction}>
                    Send NFT
                </button>
              </div>
          </div>
  );
}

export default NFTItem
