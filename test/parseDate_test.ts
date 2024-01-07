import * as assert from "https://deno.land/std/assert/mod.ts";
import {rfc822DateSchema, rfc3339DateSchema} from "../src/parseDate.ts";

Deno.test(
    "RFC822 date-time"
    , () => assert.assertEquals(
        rfc822DateSchema.parse("Sun, 17 May 92 21:31:00 +0900")
        , new Date("1992-05-17T12:31:00Z")
    )
);

Deno.test(
    "RFC822 date-time (4 DIGIT year)"
    , () => assert.assertEquals(
        rfc822DateSchema.parse("Thu, 01 Nov 2023 22:55:15 UT")
        , new Date("2023-11-01T22:55:15Z")
    )
);

Deno.test(
    "RFC822 date-time with military time zone"
    , () => assert.assertEquals(
        rfc822DateSchema.parse("Thu, 01 Nov 2023 19:55:15 C")
        , new Date("2023-11-01T22:55:15Z")
    )
);

Deno.test(
    "RFC822 date-time with contiguous U.S. time zone"
    , () => assert.assertEquals(
        rfc822DateSchema.parse("Thu, 01 Nov 2023 17:55:15 EST")
        , new Date("2023-11-01T22:55:15Z")
    )
);

Deno.test(
    "RFC3339 date-time"
    , () => assert.assertEquals(
        rfc3339DateSchema.parse("2023-11-01T22:55:15.822Z")
        , new Date("2023-11-01T22:55:15.822Z")
    )
);

Deno.test(
    "RFC3339 date-time with time-offset"
    , () => assert.assertEquals(
        rfc3339DateSchema.parse("2023-11-01T18:25:15.822-04:30")
        , new Date("2023-11-01T22:55:15.822Z")
    )
);
