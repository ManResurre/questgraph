import React, {useCallback, useEffect, useRef} from "react";
import {CryptHelper} from "@/lib/CryptHelper";
import supabase from "@/supabaseClient";
import {db, User} from "@/lib/db";

const Registration = () => {
    const hasRun = useRef(false);

    const createKeys = useCallback(async () => {
        const count = await db.user.count();
        if (count) return;

        const keyPair = await CryptHelper.generateRSAKeys();
        const publicPem = await CryptHelper.exportKey(keyPair.publicKey, 'spki');
        const privatePem = await CryptHelper.exportKey(keyPair.privateKey, 'pkcs8');

        await db.user.put({
            privateKey: privatePem!,
            publicKey: publicPem!,
        })

        return {
            publicPem,
            privatePem
        }
    }, []);

    const savePublicKey = useCallback(async (key: string) => {
        const {data} = await supabase.functions.invoke('save-public-key', {
            body: {public_key: key},
        })

        const user = await db.user.orderBy("id").first() as User;
        await db.user.put({
            ...user,
            auth_id: data.id
        })

        return data.id;
    }, []);


    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        createKeys().then((keys) => {
            if (keys) savePublicKey(keys.publicPem).then((auth_id) => {
                console.log(auth_id);

            });
        });
    }, []);


    return <div>Registration</div>
}

export default React.memo(Registration);
