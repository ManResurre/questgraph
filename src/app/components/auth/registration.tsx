import React, {useCallback, useEffect, useState} from "react";
import {CryptHelper} from "@/lib/CryptHelper";
import supabase from "@/supabaseClient";
import {db} from "@/lib/db";

interface IKeys {
    publicPem: string;
    privatePem: string;
}

const Registration = () => {

    const [keys, setKeys] = useState<IKeys>();

    const createKeys = useCallback(async () => {
        const keyPair = await CryptHelper.generateRSAKeys();
        const publicPem = await CryptHelper.exportKey(keyPair.publicKey, 'spki');
        const privatePem = await CryptHelper.exportKey(keyPair.privateKey, 'pkcs8');

        return {
            publicPem,
            privatePem
        }
    }, []);

    const savePublicKey = useCallback(async (key: string) => {
        const {data} = await supabase.functions.invoke('save-public-key', {
            body: {public_key: key},
        })

        return data.id;
    }, []);

    useEffect(() => {
        createKeys().then((keys) => {
            setKeys(keys);
        })

    }, []);

    useEffect(() => {
        if (!keys?.publicPem)
            return;

        savePublicKey(keys?.publicPem).then((userId) => {
            db.user.put({
                id: userId,
                privateKey: keys?.privatePem,
                publicKey: keys?.publicPem,
            })
        });
    }, [keys])

    return <div>Registration</div>
}

export default React.memo(Registration);
