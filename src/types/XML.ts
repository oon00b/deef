import {z} from "https://deno.land/x/zod/mod.ts";

export {emptyElementSchema, textElementSchema, nodeElementSchema, listElementSchema};

const attributeSchema = z.record(z.string().startsWith("@"), z.string());

const emptyElementSchema = (attr = {}) => {
    return z.object(attr).and(
        z.object(
            {
                "#text": z.string().length(0).nullish().transform(_ => undefined)
            }
        )
    );
};

const textElementSchema = (attr = {}, textschema : any = z.string()) => {
    return z.object({"#text": textschema}).and(
        z.object(attr)
    );
};

const nodeElementSchema = (obj : any) => z.object(obj);

const listElementSchema = (schema : any) => {
    return z.union(
        [schema, z.array(schema).nonempty()]
    ).transform(val => [val].flat());
};
