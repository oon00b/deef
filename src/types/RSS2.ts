import {z} from "https://deno.land/x/zod/mod.ts";
import {emptyElementSchema, textElementSchema, nodeElementSchema, listElementSchema} from "./XML.ts";
import {rfc822DateSchema} from "../parseDate.ts";

export {rss2Schema};
export type {RSS2};

const rss2Schema = nodeElementSchema({
    rss: nodeElementSchema({
        channel: nodeElementSchema({
            title: textElementSchema()
            , link: textElementSchema()
            , description: textElementSchema()

            , language: textElementSchema().optional()
            , copyright: textElementSchema().optional()
            , managingEditor: textElementSchema().optional()
            , webMaster: textElementSchema().optional()

            , pubDate: textElementSchema({}, rfc822DateSchema).optional()
            , lastBuildDate: textElementSchema({}, rfc822DateSchema).optional()

            , category: textElementSchema().optional()
            , generator: textElementSchema().optional()
            , docs: textElementSchema().optional()

            , cloud: emptyElementSchema().optional()

            , ttl: textElementSchema().optional()

            , image: nodeElementSchema({
                url: textElementSchema()
                , title: textElementSchema()
                , link: textElementSchema()
                , width: textElementSchema().optional()
                , height: textElementSchema().optional()
                , description: textElementSchema().optional()
            }).optional()

            , textInput: nodeElementSchema({
                title: textElementSchema()
                , description: textElementSchema()
                , name: textElementSchema()
                , link: textElementSchema()
            }).optional()

            , skipHours: textElementSchema().optional()
            , skipDays: textElementSchema().optional()

            , item: listElementSchema(
                nodeElementSchema({
                    title: textElementSchema().optional()
                    , description: textElementSchema().optional()
                    , link: textElementSchema().optional()
                    , author: textElementSchema().optional()

                    , category: listElementSchema(
                        textElementSchema()
                    ).optional()

                    , comments: textElementSchema().optional()

                    , enclosure: emptyElementSchema({
                        "@url": z.string()
                        , "@length": z.string()
                        , "@type": z.string()
                    }).optional()

                    , guid: textElementSchema().optional()

                    , pubDate: textElementSchema({}, rfc822DateSchema).optional()

                    , source: textElementSchema().optional()
                })
                /*.refine(
                    items => items.every(i => i?.title || i?.description)
                    , {message: "<item> element must contain <title> or <description>"}
                )*/
            )
        })
    })
});

type RSS2 = z.output<typeof rss2Schema>;
