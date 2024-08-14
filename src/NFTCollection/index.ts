import {
    Address,
    TupleItemCell,
    TupleItemInt,
  } from "@ton/core";
import { TonClient } from "@ton/ton";
import { flattenSnakeCell } from "../utils";
import { toUserFriendlyAddress } from "@tonconnect/ui-react";

export type CollectionData = {
    ownerAddress: Address;
    royaltyPercent: number;
    royaltyAddress: Address;
    nextItemIndex: number;
    collectionContentUrl: string;
    commonContentUrl: string;
  }

export class NftCollection {
    private collectionAddress: Address
    private client: TonClient
  
    constructor(
        collectionAddress: Address,
        client: TonClient
    ) {
      this.collectionAddress = collectionAddress;
      this.client = client
    }

    async getCollectionData() {
        const response = await this.client.runMethod(
            this.collectionAddress,
            "get_collection_data",
            []
          );
        const numberOfNFTs = response.stack.readNumber()
        const collectionContent = response.stack.readCell()
        const ownerAddress = response.stack.readAddressOpt()
        return {numberOfNFTs, collectionContent, ownerAddress}
    }

    async getNFTAddressByIndex(itemIndex: number) {
        const response = await this.client.runMethod(
            this.collectionAddress,
            "get_nft_address_by_index",
            [{ type: "int", value: BigInt(itemIndex) }]
          );
        const nftItemAddress = response.stack.readAddress()
        return nftItemAddress
    }

    private async getNFTData(nftItemAddress: Address) {
        const response = await this.client.runMethod(
            nftItemAddress,
            "get_nft_data",
            []
          );
        const nftDataStack = response.stack
        nftDataStack.skip(1)
        const nftDataIndex = nftDataStack.readBigNumber()
        nftDataStack.readAddress()
        const ownerAddress = nftDataStack.readAddress()
        const individual_item_content = nftDataStack.readCell()

        return {
            nftDataIndex,
            individual_item_content,
            ownerAddress
        }
    }

    async getNFTContent(myAddress: string, nftItemAddress: Address): Promise<string | null> {
        const {
            nftDataIndex,
            individual_item_content,
            ownerAddress
        } = await this.getNFTData(nftItemAddress)
        
        const nftOwnerAddress = toUserFriendlyAddress(ownerAddress.toRawString())
        if(myAddress !== nftOwnerAddress as any) {
            return null
        }
        const arg1: TupleItemInt = {
            type: "int",
            value: nftDataIndex
        }
      
        const arg2: TupleItemCell = {
            type: "cell",
            cell: individual_item_content
        }
        const response = await this.client.runMethod(
            this.collectionAddress,
            "get_nft_content",
            [arg1, arg2]
          );
        const cell = response.stack.readCell()
        const buffer = flattenSnakeCell(cell)
        return buffer.toString()
    }
    // async async transfer(
    //     nftAddress: Address,
    //     newOwner: Address
    //   ): Promise<number> {
    //     const seqno = await wallet.contract.getSeqno();
    
    //     await wallet.contract.sendTransfer({
    //       seqno,
    //       secretKey: wallet.keyPair.secretKey,
    //       messages: [
    //         internal({
    //           value: "0.05",
    //           to: nftAddress,
    //           body: this.createTransferBody({
    //             newOwner,
    //             responseTo: wallet.contract.address,
    //             forwardAmount: toNano("0.02"),
    //           }),
    //         }),
    //       ],
    //       sendMode: SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
    //     });
    //     return seqno;
    //   }
    
    //   static createTransferBody(params: {
    //     newOwner: Address;
    //     responseTo?: Address;
    //     forwardAmount?: bigint;
    //   }): Cell {
    //     const msgBody = beginCell();
    //     msgBody.storeUint(0x5fcc3d14, 32);
    //     msgBody.storeUint(0, 64);
    //     msgBody.storeAddress(params.newOwner);
    //     msgBody.storeAddress(params.responseTo || null);
    //     msgBody.storeBit(false); // no custom payload
    //     msgBody.storeCoins(params.forwardAmount || 0);
    //     msgBody.storeBit(0); // no forward_payload 
    
    //     return msgBody.endCell();
    //   }
  }