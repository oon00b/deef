import {z} from "https://deno.land/x/zod/mod.ts";
import {rfc3339DateSchema} from "../parseDate.ts";

export {jsonFeedSchema};
export type {JSONFeed};

const customPropertySchema = z.record(z.string().startsWith("_"), z.unknown());

// objectとrecordの結合がうまく動かない <https://github.com/colinhacks/zod/issues/2200>
//const objectSchema = (obj : any) => z.object(obj).strict().and(customPropertySchema);
const objectSchema = (obj : any) => z.object(obj);

const jsonFeedSchema = objectSchema({
    version: z.string().default("https://jsonfeed.org/version/1.1")
    , title: z.string()

    , home_page_url: z.string().optional()
    , feed_url: z.string().optional()
    , description: z.string().optional()
    , user_comment: z.string().optional()
    , next_url: z.string().optional()
    , icon: z.string().optional()
    , favicon: z.string().optional()

    , authors: z.array(
        objectSchema(
            {
                name: z.string().optional()
                , url: z.string().optional()
                , avatar: z.string().optional()
            }
        )
    ).optional()

    , language: z.string().optional()

    , expired: z.boolean().optional()

    , hubs: z.array(
        objectSchema(
            {
                type: z.string()
                , url: z.string()
            }
        )
    ).optional()

    , items: z.array(
        objectSchema(
            {
                 id: z.string()

                , url: z.string().optional()
                , external_url: z.string().optional()
                , title: z.string().optional()
                , content_html: z.string().optional()
                , content_text: z.string().optional()
                , summary: z.string().optional()
                , image: z.string().optional()
                , banner_image: z.string().optional()

                , date_published: rfc3339DateSchema.optional()
                , date_modified: rfc3339DateSchema.optional()

                , authors: z.array(
                    objectSchema(
                        {
                            name: z.string().optional()
                            , url: z.string().optional()
                            , avatar: z.string().optional()
                        }
                    )
                ).optional()

                , tags: z.array(z.string()).optional()

                , language: z.string().optional()

                , attachments: z.array(
                    objectSchema(
                        {
                            url: z.string()
                            , mime_type: z.string()
                            , title: z.string().optional()
                            , size_in_bytes: z.number().optional()
                            , duration_in_seconds: z.number().optional()
                        }
                    )
                ).optional()
            }
        )
    )
});

type JSONFeed = z.output<typeof jsonFeedSchema>;
