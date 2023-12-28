import {z} from "https://deno.land/x/zod/mod.ts";
import {emptyElementSchema, textElementSchema, nodeElementSchema, listElementSchema} from "./XML.ts";
import {rfc3339DateSchema} from "../parseDate.ts";

export {rss1Schema};
export type {RSS1};

const rss1Schema = nodeElementSchema({
    "rdf:RDF": nodeElementSchema({
        channel: nodeElementSchema({
            "@rdf:about": z.string()
            , title: textElementSchema()
            , link: textElementSchema()
            , description: textElementSchema()

            , image: emptyElementSchema({
                "@rdf:resource": z.string()
            }).optional()

            , items: nodeElementSchema({
                "rdf:Seq": nodeElementSchema({
                    "rdf:li": listElementSchema(
                        nodeElementSchema({
                            "@rdf:resource": z.string()
                        })
                    )
                })
            })

            , textinput: emptyElementSchema({
                "@rdf:resource": z.string()
            }).optional()
        })

        , image: nodeElementSchema({
            "@rdf:about": z.string()
            , title: textElementSchema()
            , link: textElementSchema()
            , url: textElementSchema()
        }).optional()

        , item: listElementSchema(
            nodeElementSchema({
                "@rdf:about": z.string()
                , title: textElementSchema()
                , link: textElementSchema()
                , description: textElementSchema().optional()
                , "dc:date": textElementSchema({}, rfc3339DateSchema).optional()
            })
        )

        , textinput: nodeElementSchema({
            "@rdf:about": z.string()
            , title: textElementSchema()
            , description: textElementSchema()
            , name: textElementSchema()
            , link: textElementSchema()
        }).optional()
    })
});

type RSS1 = z.output<typeof rss1Schema>;
