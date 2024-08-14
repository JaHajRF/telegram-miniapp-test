import { Address, beginCell, BitBuilder, BitReader, Cell, toNano } from "@ton/core";
import { CHAIN, SendTransactionRequest } from "@tonconnect/ui-react";
import { Buffer } from "buffer";

export const getIpfsGatewayUrl = (ipfsUrl: string) => {
    const splitUrl = ipfsUrl.split('//')
    return `https://ipfs.io/ipfs/${splitUrl[1]}`
}


export function flattenSnakeCell(cell: Cell): Buffer {
    let c: Cell | null = cell;
  
    const bitResult = new BitBuilder();
    while (c) {
      const cs = c.beginParse();
      if (cs.remainingBits === 0) {
        break;
      }
  
      const data = cs.loadBits(cs.remainingBits);
      bitResult.writeBits(data);
      c = c.refs && c.refs[0];
    }
  
    const endBits = bitResult.build();
    const reader = new BitReader(endBits);
  
    return reader.loadBuffer(reader.remaining / 8);
  }


  export const createTransferRequest = (network: CHAIN, nftAddress: string, myAddress: string, receiverAddress: string): SendTransactionRequest => {
    const receiverAddressParsed = Address.parseFriendly(receiverAddress)
    const myAddressParsed = Address.parseFriendly(myAddress)
     // The transaction is valid for 10 minutes.
    const validUntil = Math.floor(Date.now() / 1000) + 600;
    const sendTxRequest: SendTransactionRequest = {
        validUntil,
        network,
        messages: [
          {
            amount: toNano("0.05").toString(),
            address: nftAddress,
            payload: createTransferBody(
              receiverAddressParsed.address,
              myAddressParsed.address,
              toNano("0.02"),
            ),
          }
        ]

    }
    return sendTxRequest
}

const createTransferBody = (
    newOwner: Address,
    responseTo?: Address,
    forwardAmount?: bigint
  ) => {
    const msgBody = beginCell();
    msgBody.storeUint(0x5fcc3d14, 32);
    msgBody.storeUint(0, 64);
    msgBody.storeAddress(newOwner);
    msgBody.storeAddress(responseTo || null);
    msgBody.storeBit(false); // no custom payload
    msgBody.storeCoins(forwardAmount || 0);
    msgBody.storeBit(0); // no forward_payload 

    return msgBody.endCell().toBoc().toString('base64');
  }