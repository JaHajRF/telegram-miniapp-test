import { useEffect, useState } from "react";
import { NftCollection } from "../NFTCollection";
import { getIpfsGatewayUrl } from "../utils";
import { Address } from "@ton/core";

export interface IUseMyNFTsContentUrls {
    nftCollection: NftCollection | null,
    numberOfNFTs: number
    myAddress: string | null
}

export interface INftContentData {
    nftContentsUrl: string,
    nftAddress: Address
}

const fetchNFTSContentUrls = async (myAddress: string, nftCollection: NftCollection, numberOfNFTs: number) => {
    const indexesArr = Array.from(Array(numberOfNFTs).keys());

    const nftContentsUrls: INftContentData[] = []
    for await (const index of indexesArr) {
        const nftAddress = await nftCollection.getNFTAddressByIndex(index)
        const nftContent = await nftCollection.getNFTContent(myAddress, nftAddress)
        if(nftContent) {
            const nftData = {
                nftContentsUrl: getIpfsGatewayUrl(nftContent),
                nftAddress
            }
            nftContentsUrls.push(nftData)
        }
    }
    return nftContentsUrls
}

export function useMyNFTsContentUrls({ nftCollection, numberOfNFTs, myAddress }: IUseMyNFTsContentUrls) {
    const [nftContentsData, setNftContentsData] = useState<INftContentData[]>([])

    useEffect(() => {
        if(nftCollection && numberOfNFTs && myAddress) {
            fetchNFTSContentUrls(myAddress, nftCollection, numberOfNFTs).then(nftContent => {
                setNftContentsData(nftContent)
            })
        }
    }, [nftCollection, numberOfNFTs, myAddress])

    return nftContentsData
}