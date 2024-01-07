/** @jsxImportSource https://esm.sh/preact */
import {render} from "npm:preact-render-to-string"
import {JSONFeed} from "./types/JSONFeed.ts";

export {printFeeds};

const sortArticles = (feeds: Array<JSONFeed>) => {
    return feeds.map(
        f => f.items.map(
            i => {
                return {
                    home_page_url: f.home_page_url
                    , home_page_title: f.title
                    , url: i.url ?? i.id
                    , title: i.title ?? i.url ?? i.id
                    , date: i.date_modified ?? i.date_published
                };
            }
        )
    ).flat().sort(
        (a, b) => {
            if(a?.date === undefined || b?.date === undefined){
                return a?.date === undefined ? 1 : -1;
            }

            if(Number.isNaN(a.date.valueOf()) || Number.isNaN(b.date.valueOf())){
                return Number.isNaN(a.date.valueOf()) ? 1 : -1;
            }

            return (a.date.valueOf() - b.date.valueOf()) * -1;
        }
    ).slice(0, 200);
};

const anchor = (link, title?) => {
    return (
        <a href={link} referrerpolicy="no-referrer">{title ?? link}</a>
    );
};

const row = (article) => {
    return (
        <tr>
            <td><time datetime={article.date?.toISOString()}>{article.date?.toString()}</time></td>
            <td>{anchor(article.home_page_url, article.home_page_title)}</td>
            <td>{anchor(article.url, article.title)}</td>
        </tr>
    );
}

const printFeeds = (feeds : Array<JSONFeed>): string => {
    return render(
        <>
        <table>
            <caption>List of articles</caption>
            <thead>
                <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Arrived from</th>
                    <th scope="col">Article</th>
                </tr>
            </thead>
            <tbody>{...sortArticles(feeds).map(row)}</tbody>
        </table>
        </>
    );
};
