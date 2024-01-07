import {z} from "https://deno.land/x/zod/mod.ts";

export {rfc822DateSchema, rfc3339DateSchema};

const monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const contiguousUSTimezone = ["EDT", "EST", "CDT", "CST", "MDT", "MST", "PDT", "PST"] as const;

const rfc822DatePattern = new RegExp(
    "^"
    + "(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), ){0,1}"
    + "(?<day>[0-9]{2})"
    + " "
    + "(?<month>"
    + monthStrings.reduce((prev, current) => prev !== "" ? `${prev}|${current}` : current, "")
    + ")"
    + " "
    // 規格上はyearは2桁の数字だが、4桁表記のフィードがほとんどのため、そちらにも対応する。
    + "(?<year>(?:[0-9]{4}|[0-9]{2}))"
    + " "
    + "(?<hour>[0-9]{2}):(?<minute>[0-9]{2})(?:[:](?<second>[0-9]{2})){0,1}"
    + " "
    + "(?:"
    + "(?<offset_sign>[+-])(?<offset_hour>[0-9]{2})(?<offset_minute>[0-9]{2})"
    + "|"
    + "(?:UT|GMT|Z)"
    + "|"
    + "(?<contiguous_us_timezone>"
    + contiguousUSTimezone.reduce((prev, current) => prev !== "" ? `${prev}|${current}` : current, "")
    + ")"
    + "|"
    + "(?<military_timezone>[A-IK-Y])"
    + ")"
    + "$"
);

const rfc3339DatePattern = new RegExp(
    "^"
    + "(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})"
    + "T"
    + "(?<hour>[0-9]{2}):(?<minute>[0-9]{2}):(?<second>[0-9]{2})"
    + "(?:"
    + "[.]"
    // 0.001秒未満はDateで扱えないため切り捨てる。
    + "(?<secfrac>[0-9]{1,3})[0-9]*"
    + "){0,1}"
    + "(?:"
    + "Z"
    + "|"
    + "(?<offset_sign>[+-])(?<offset_hour>[0-9]{2}):(?<offset_minute>[0-9]{2})"
    + ")"
    + "$"
);

const rfc822DatePatternSchema = z.object({
    year: z.coerce.number().int()
    , month: z.enum(monthStrings).transform(m => monthStrings.indexOf(m))
    , day: z.coerce.number().int()
    , hour: z.coerce.number().int()
    , minute: z.coerce.number().int()
    , second: z.coerce.number().int().optional()
}).transform(
    ({year, month, day, hour, minute, second}) => {
        return new Date(
            Date.UTC(
                year
                , month
                , day
                , hour
                , minute
                , second ?? 0
            )
        );
    }
);

const rfc3339DatePatternSchema = z.object({
    year: z.coerce.number().int()
    , month: z.coerce.number().int().transform(m => m - 1)
    , day: z.coerce.number().int()
    , hour: z.coerce.number().int()
    , minute: z.coerce.number().int()
    , second: z.coerce.number().int()
    , secfrac: z.coerce.number().int().optional()
}).transform(
    ({year, month, day, hour, minute, second, secfrac}) => {
        return new Date(
            Date.UTC(
                year
                , month
                , day
                , hour
                , minute
                , second
                , secfrac ?? 0
            )
        );
    }
);

const getOffsetValue = (offset_sign : number, offset_hour : number, offset_minute : number) => {
    const sec = 1000;
    const min = sec * 60;
    const h = min * 60;

    return (offset_hour * h + offset_minute * min) * offset_sign;
};

const offsetSchema = z.object({
    offset_sign: z.enum(["+", "-"]).transform(s => s === "+" ? 1 : -1)
    , offset_hour: z.coerce.number().int()
    , offset_minute: z.coerce.number().int()
}).transform(
    ({offset_sign, offset_hour, offset_minute}) => getOffsetValue(offset_sign, offset_hour, offset_minute)
);

const contiguousUSTimezoneSchema = z.object({
    contiguous_us_timezone: z.enum(contiguousUSTimezone)
}).transform(
    ({contiguous_us_timezone}) => {
        const index = contiguousUSTimezone.indexOf(contiguous_us_timezone);
        return getOffsetValue(-1, 4 + index - Math.floor(index / 2), 0);
    }
);

const militaryTimeZoneSchema = z.object({
    military_timezone: z.string()
}).transform(
    ({military_timezone}) => {
        let cp  = military_timezone.charCodeAt(0);

        if(cp < "N".charCodeAt(0)){
            if(cp > "J".charCodeAt(0)){
                cp--;
            }

            return getOffsetValue(-1, cp - "A".charCodeAt(0) + 1, 0);
        }

        return getOffsetValue(1, cp - "N".charCodeAt(0) + 1, 0);
    }
);

const rfc822DateSchema = z.union([
    z.date()
    , z.string()
        .transform(s => s.match(rfc822DatePattern)?.groups)
        .refine(g => g, {message: "Must be RFC822 date-time string"})
        .transform(g => {
            const date = rfc822DatePatternSchema.parse(g);

            const offset = z.union([
                offsetSchema
                , contiguousUSTimezoneSchema
                , militaryTimeZoneSchema
            ]).catch(0).parse(g);

            return new Date(date.valueOf() - offset);
        })
]);

const rfc3339DateSchema = z.union([
    z.date()
    , z.string()
        .transform(s => s.match(rfc3339DatePattern)?.groups)
        .refine(g => g, {message: "Must be RFC3339 date-time string"})
        .transform(g => {
            const date = rfc3339DatePatternSchema.parse(g);

            const offset = offsetSchema.catch(0).parse(g);

            return new Date(date.valueOf() - offset);
        })
]);
