import './App.css';
import { TonConnectButton, toUserFriendlyAddress, useTonWallet } from '@tonconnect/ui-react';
import '@twa-dev/sdk';
import { useNFTCollection } from './hooks/useNFTCollection';
import { NFT_COLLECTION_ADDRESS } from './consts';
import { useTonClient } from './hooks/useTonClient';
import { useEffect, useState } from 'react';
import NFTItem from './components/NFTItem';
import { useMyNFTsContentUrls } from './hooks/useMyNFTsContentUrls';


function App() {
  const collectionAddress = NFT_COLLECTION_ADDRESS as any
  const [myAddress, setMyAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useTonWallet()
  const [numberOfNFTs, setNumberOfNFTs] = useState<number>(0)
  
  const tonClient = useTonClient({network: 'testnet'})
  const nftCollection = useNFTCollection({ collectionAddress, client: tonClient })
  const nftContentsData = useMyNFTsContentUrls({nftCollection, numberOfNFTs, myAddress})

  useEffect(() => {
    if(wallet) {
      setMyAddress(toUserFriendlyAddress(wallet?.account.address))
    }
  },[wallet])

  useEffect(() => {
    if(myAddress && nftContentsData.length === 0) {
      setIsLoading(true)
      return
    }
    setIsLoading(false)
  }, [myAddress, nftContentsData.length])
  
  

  useEffect(() => {
    if(nftCollection) {
      nftCollection.getCollectionData().then((collectionData) => {
        if(collectionData.numberOfNFTs) {
          setNumberOfNFTs(collectionData.numberOfNFTs)
        }
      })
    }
  }, [nftCollection])
  return (
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />
        <div className='Card'>
          <b>Wallet address</b>
          <div className='Hint'>{myAddress}</div>
        </div>
        {isLoading ? <div>Loading...</div> : (
        <div className='NFTSection'>
          <b className='NFTSection-title'>My NFTs:</b>
          {myAddress && nftContentsData.map(nftContent => (
            <NFTItem 
              key={`nft-item-${nftContent.nftAddress.toString()}`} 
              nftAddress={nftContent.nftAddress} 
              myNFTsContentUrl={nftContent.nftContentsUrl}
              myAddress={myAddress}
            />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

export default App