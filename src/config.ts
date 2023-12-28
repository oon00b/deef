import {z} from "https://deno.land/x/zod/mod.ts";

import {jsonFeedSchema} from "./types/JSONFeed.ts"
import {printFeeds} from "./printFeed.tsx"

const configSchema = z.object({
    filter: z.function().args(z.array(jsonFeedSchema)).returns(z.string()).default(printFeeds)
    output: z.string().min(0).optional()
    feeds: z.array(
        z.union([
            z.string()
            , z.object({
                resource: z.string()
                , getter: z.function().args(z.string()).returns(jsonFeedSchema).optional()
            })
        ])
    ).nonempty()
});

type Config = z.output<typeof configSchema>;
