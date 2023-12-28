import * as xml from "https://deno.land/x/xml/mod.ts";
import {atomSchema} from "./types/Atom.ts";
import {rss1Schema} from "./types/RSS1.ts";
import {rss2Schema} from "./types/RSS2.ts";
import {jsonFeedSchema} from "./types/JSONFeed.ts";
import {atomToJSONFeed, rss1ToJSONFeed, rss2ToJSONFeed} from "./toJSONFeed.ts";

export {parseFeed};

const parseFeed = (blob: Blob): Promise<JSONFeed> => {
    if(blob.type === "application/json" || blob.type === "application/feed+json"){
        return blob.text()
            .then(
                text => JSON.parse(text)
            )
            .then(
                j => jsonFeedSchema.parse(j)
            );
    }

    return blob.text()
        .then(
            text => xml.parse(
                text
                , {
                    reviveNumbers: false
                    , reviveBooleans: false
                    , emptyToNull: false
                    , flatten: false
                }
            )
        )
        .then(
            feed => {
                if(feed?.feed){
                    return atomToJSONFeed(atomSchema.parse(feed));
                }

                if(feed?.["rdf:RDF"]){
                    return rss1ToJSONFeed(rss1Schema.parse(feed));
                }

                if(feed?.rss){
                    return rss2ToJSONFeed(rss2Schema.parse(feed));
                }

                throw new Error("Error");
            }
        );
};


