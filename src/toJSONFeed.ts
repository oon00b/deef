import {Atom} from "./types/Atom.ts";
import {RSS1} from "./types/RSS1.ts";
import {RSS2} from "./types/RSS2.ts";
import {JSONFeed, jsonFeedSchema} from "./types/JSONFeed.ts";

export {atomToJSONFeed, rss1ToJSONFeed, rss2ToJSONFeed};

const atomToJSONFeed = (atom: Atom): JSONFeed => {
    const getHTMLLink = (links) => {
        const alt_links = links.filter(
            elem =>  elem["@rel"] == "alternate"
        );

        return alt_links.find(elem => elem["@type"] === "text/html")?.["@href"]
                ?? alt_links[0]?.["@href"]
                ?? links[0]?.["@href"];
    };

    const getAttachments = (links) => {
        const attachments = links.filter(
            l => l["@rel"] == "enClousure"
        ).map(
            l => {
                return {
                    url: l["@href"]
                    , mime_type: l["@type"]
                }
            }
        );

        return attachments.length > 0 ? attachments : undefined;
    }

    const items = atom.feed?.entry?.map(
        ({id, link, title, published, updated}) => {
            return {
                title: title["#text"]
                , url: getHTMLLink(link)
                , id: id["#text"]
                , date_published: published?.["#text"]
                , date_modified: updated["#text"]
                , attachments: getAttachments(link)
            }
        }
    );

    return jsonFeedSchema.parse({
        title: atom.feed.title["#text"]
        , home_page_url: getHTMLLink(atom.feed.link)
        , feed_url: atom.feed.link.find(l => l["@rel"] === "self" )?.["@href"]
        , items
    });
};

const rss1ToJSONFeed = (rss1: RSS1): JSONFeed => {
    const channel = rss1["rdf:RDF"].channel;

    const items = rss1["rdf:RDF"].item.map(
        (i) => {
            return {
                title: i.title["#text"]
                , url: i.link["#text"]
                , id: i.link["#text"]
                , date_published: i?.["dc:date"]?.["#text"]
            };
        }
    );

    return jsonFeedSchema.parse({
        title: channel.title["#text"]
        , home_page_url: channel.link["#text"]
        , feed_url: channel["@rdf:about"]
        , items
    });
};

const rss2ToJSONFeed = (rss2: RSS2): JSONFeed => {
    const channel = rss2.rss.channel;

    const items = channel.item.map(
        ({title, link, pubDate, enclosure}) => {
            return {
                title: title["#text"]
                , url: link["#text"]
                , id: link["#text"]
                , date_published: pubDate?.["#text"]
                , attachments: enclosure !== undefined ? [
                    {
                        url: enclosure["@url"]
                        , mime_type: enclosure["@type"]
                        , size_in_bytes: Number(enclosure["@length"])
                    }
                ] : undefined
            };
        }
    );

    return jsonFeedSchema.parse({
        title: channel.title["#text"]
        , home_page_url: channel.link["#text"]
        , items
    });
};
