import * as assert from "https://deno.land/std/assert/mod.ts";
import * as xml from "https://deno.land/x/xml/mod.ts";
import {jsonFeedSchema} from "../src/types/JSONFeed.ts";
import {atomSchema} from "../src/types/Atom.ts";
import {rss1Schema} from "../src/types/RSS1.ts";
import {rss2Schema} from "../src/types/RSS2.ts";

const parseXML = (text : string) => {
    return xml.parse(
        text
        , {
            reviveNumbers: false
            , reviveBooleans: false
            , emptyToNull: false
            , flatten: false
        }
    );
};

Deno.test(
    "JSONFeed"
    , async () => {
        const file = await Deno.readTextFile("./test/feed/valid-jsonfeed.json");
        jsonFeedSchema.parse(JSON.parse(file));
    }
);

Deno.test(
    "Atom"
    , async () => {
        const file = await Deno.readTextFile("./test/feed/valid-atom.xml");
        atomSchema.parse(parseXML(file));
    }
);

Deno.test(
    "RSS 1.0"
    , async () => {
        const file = await Deno.readTextFile("./test/feed/valid-rss1.0.xml");
        rss1Schema.parse(parseXML(file));
    }
);

Deno.test(
    "RSS 2.0"
    , async () => {
        const file = await Deno.readTextFile("./test/feed/valid-rss2.0.xml");
        rss2Schema.parse(parseXML(file));
    }
);
