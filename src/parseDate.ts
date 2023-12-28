import {z} from "https://deno.land/x/zod/mod.ts";

export {rfc822DateSchema, rfc3339DateSchema};

const monthList : Array<string> = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const RFC822DatePattern : RegExp = new RegExp(
    "^"
    + "(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), ){0,1}"
    + "(?<day>[0-9]{2})"
    + " "
    + "(?<month>"
    + `${
        monthList.reduce(
            (prev, current) => prev !== "" ? `${prev}|${current}` : current
                    , ""
        )
    }`
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
    + "(?<contiguous_us_timezone>EST|EDT|CST|CDT|MST|MDT|PST|PDT)"
    + "|"
    + "(?<military_timezone>[A-IK-Y])"
    + ")"
    + "$"
);

const RFC3339DatePattern : RegExp = new RegExp(
    "^"
    + "(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})"
    + "T"
    + "(?<hour>[0-9]{2}):(?<minute>[0-9]{2}):(?<second>[0-9]{2})"
    + "(?:"
    + "[.]"
    // 0.001秒以下はDateで扱えないため切り捨てる。
    + "(?<secfrac>[0-9]{1,3})[0-9]*"
    + "){0,1}"
    + "(?:"
    + "Z"
    + "|"
    + "(?<offset_sign>[+-])(?<offset_hour>[0-9]{2}):(?<offset_minute>[0-9]{2})"
    + ")"
    + "$"
);

const getAST = (datestr : string, pattern : RegExp, replacer : (key : string, value: string) => any): any => {
    const groups = datestr.match(pattern)?.groups

    if(!groups) {
        throw new Error("Parse Error !");
    }

    if(!replacer){
        return groups;
    }

    return Object.entries(groups)
        .reduce(
            (prev, [key, value]) => Object.assign(prev, replacer(key, value))
            , {}
        );
};

const parseRFC822Date = (datestr : string): Date => {
    const toMilitaryTimeZone = (c : string) => {
        let cp  = c.codePointAt(0) as number;

        if(cp < ("N".codePointAt(0) as number)){
            if(cp > ("J".codePointAt(0) as number)){
                cp--;
            }
            return {
                offset_sign: -1
                , offset_hour: cp - ("A".codePointAt(0) as any) + 1
                , offset_minute: 0
            }
        }

        return {
            offset_sign: 1
            , offset_hour: cp - ("N".codePointAt(0) as any) + 1
            , offset_minute: 0
        }
    };

    const toContiguousUSTimeZone = (str : string) => {
        return {
            offset_sign: -1
            , offset_hour:Object(
                {
                    "EST" : 5
                    , "EDT" : 4
                    , "CST" : 6
                    , "CDT" : 5
                    , "MST" : 7
                    , "MDT" : 6
                    , "PST" : 8
                    , "PDT" : 7
                }
            )[str]
            , offset_minute: 0
        };
    };

    const replacer = (key : string, value : string) => {
        if(!value){
            return {};
        }

        switch(key){
            case "offset_sign":
                return {[key]: (value === "+" ? 1 : -1)};
            case "month":
                return {[key]: monthList.indexOf(value)};
            case "contiguous_us_timezone":
                return toContiguousUSTimeZone(value);
            case "military_timezone":
                return toMilitaryTimeZone(value);
            default:
                break;
        }

        return {[key]: parseInt(value, 10)};
    }

    const obj = getAST(datestr, RFC822DatePattern, replacer);

    const datetime = new Date(
        Date.UTC(
            obj.year
            , obj.month
            , obj.day
            , obj.hour
            , obj.minute
            , obj.second
        )
    );

    if(obj?.offset_sign){
        const offset = new Date(
            obj.offset_sign * ((obj.offset_hour * 60 * 60 * 1000) + (obj.offset_minute * 60 * 1000))
        );

        return new Date(datetime.valueOf() - offset.valueOf());
    }

    return datetime;
};

const parseRFC3339Date = (datestr : string): Date => {
    const replacer = (key : string, value : string) => {
        if(!value){
            return {[key]: value};
        }

        switch(key){
            case "offset_sign":
                return {[key]: (value === "+" ? 1 : -1)};
            case "month":
                return {[key]: parseInt(value, 10) - 1};
            default:
                break;
        }

        return {[key]: parseInt(value, 10)};
    }

    const obj = getAST(datestr, RFC3339DatePattern, replacer);

    const datetime = new Date(
        Date.UTC(
            obj.year
            , obj.month
            , obj.day
            , obj.hour
            , obj.minute
            , obj.second
            , obj?.secfrac ?? 0
        )
    );

    if(obj?.offset_sign){
        const offset = new Date(
            obj.offset_sign * ((obj.offset_hour * 60 * 60 * 1000) + (obj.offset_minute * 60 * 1000))
        );

        return new Date(datetime.valueOf() - offset.valueOf());
    }

    return datetime;
};

const rfc822DateSchema = z.union([
    z.date()
    , z.string()
        .regex(RFC822DatePattern, {message: "Must be RFC822 date-time string"})
        .transform(parseRFC822Date)
]);

const rfc3339DateSchema = z.union([
    z.date()
    , z.string()
        .regex(RFC3339DatePattern, {message: "Must be RFC3339 date-time string"})
        .transform(parseRFC3339Date)
]);

