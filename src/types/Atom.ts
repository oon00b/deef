import {z} from "https://deno.land/x/zod/mod.ts";
import {emptyElementSchema, textElementSchema, nodeElementSchema, listElementSchema} from "./XML.ts";
import {rfc3339DateSchema} from "../parseDate.ts";

export {atomSchema};
export type {Atom};

const plainTextConstructSchema = textElementSchema({
    "@type": z.enum(["text", "html", ""]).optional().transform(t => !t ? "text" : t)
});

const xhtmlTextConstructSchema = nodeElementSchema({
    "@type": z.string().regex(/^xhtml$/)
    , "div": z.unknown().optional()
});

const textConstructSchema = z.union([plainTextConstructSchema, xhtmlTextConstructSchema]);

const personConstructSchema = nodeElementSchema({
    name: textElementSchema()
    , uri: textElementSchema().optional()
    , email: textElementSchema().optional()
});

const dateConstructSchema = textElementSchema({}, rfc3339DateSchema);

const authorSchema = personConstructSchema;

const categorySchema = emptyElementSchema({
    "@term": z.string()
    , "@scheme": z.string().optional()
    , "@label": z.string().optional()
});

const contentSchema = z.union([
    plainTextConstructSchema
    , xhtmlTextConstructSchema
    , emptyElementSchema({
        "@src": z.string()
        , "@type": z.string()
    })
    , z.unknown()
]);

const contributorSchema = personConstructSchema;

const generatorSchema = textElementSchema({
    "@url": z.string().optional()
    , "@version": z.string().optional()
});

const iconSchema = textElementSchema();

const idSchema = textElementSchema();

const linkSchema = emptyElementSchema({
    "@href": z.string()
    , "@rel": z.string().optional().transform(r => !r ? "alternate" : r)
    , "@type": z.string().optional()
    , "@hreflang": z.string().optional()
    , "@title": z.string().optional()
    , "@length": z.string().optional()
});

const logoSchema = textElementSchema();

const publishedSchema = dateConstructSchema;

const rightsSchema = personConstructSchema;

const subtitleSchema = textConstructSchema;

const summarySchema = textConstructSchema;

const titleSchema = textConstructSchema;

const  updatedSchema = dateConstructSchema;

const sourceSchema = nodeElementSchema({
    author: listElementSchema(authorSchema).optional()
    , category: listElementSchema(categorySchema).optional()
    , contributor: listElementSchema(contributorSchema).optional()
    , generator: generatorSchema.optional()
    , icon: iconSchema.optional()
    , id: idSchema.optional()
    , link: listElementSchema(linkSchema).optional()
    , logo: logoSchema.optional()
    , rights: rightsSchema.optional()
    , subtitle: subtitleSchema.optional()
    , title: titleSchema.optional()
    , updated: updatedSchema.optional()
});

const entrySchema = nodeElementSchema({
    author: listElementSchema(authorSchema).optional()
    , category: listElementSchema(categorySchema).optional()
    , content: contentSchema.optional()
    , contributor: listElementSchema(contributorSchema).optional()
    , id: idSchema
    , link: listElementSchema(linkSchema)
    , published: publishedSchema.optional()
    , rights: rightsSchema.optional()
    , source: sourceSchema.optional()
    , summary: summarySchema.optional()
    , title: titleSchema
    , updated: updatedSchema
});

const feedSchema = nodeElementSchema({
    author: listElementSchema(authorSchema).optional()
    , category: listElementSchema(categorySchema).optional()
    , contributor: listElementSchema(contributorSchema).optional()
    , generator: generatorSchema.optional()
    , icon: iconSchema.optional()
    , id: idSchema
    , link: listElementSchema(linkSchema)
    , logo: logoSchema.optional()
    , rights: rightsSchema.optional()
    , subtitle: subtitleSchema.optional()
    , title: titleSchema
    , updated: updatedSchema
    , entry: listElementSchema(entrySchema).optional()
});

const atomSchema = nodeElementSchema({
    feed: feedSchema
});

type Atom = z.output<typeof atomSchema>;
