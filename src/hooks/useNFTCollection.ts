import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { useEffect, useState } from "react";
import { NftCollection } from "../NFTCollection";

export interface IUseNFTCollection {
    collectionAddress: Address | null
    client: TonClient | null
}

export function useNFTCollection({ collectionAddress, client }: IUseNFTCollection) {
    const [nftCollection, setNftCollection] = useState<NftCollection | null>(null)

    useEffect(() => {
        if(collectionAddress && client) {
            setNftCollection(new NftCollection(collectionAddress, client))
        }
    }, [collectionAddress, client])

    return nftCollection
}