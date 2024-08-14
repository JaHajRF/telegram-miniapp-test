import { TonClient } from "@ton/ton";
import { useEffect, useState } from "react";
import { getHttpEndpoint } from "@orbs-network/ton-access";

export interface IUseTonClient {
    network: "testnet" | "mainnet"
}

export function useTonClient({ network }: IUseTonClient) {
    const [client, setClient] = useState<TonClient | null>(null)

    useEffect(() => {
        getHttpEndpoint({ network }).then((endpoint) => {
            const client = new TonClient({
                endpoint,
              });
              setClient(client)
        });

    }, [network])

    return client
}