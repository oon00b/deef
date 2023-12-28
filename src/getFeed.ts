export {getFeed};

const getFeed = (url) => {
    return fetch(url)
    .then(
        response => {
            if(!response.ok){
                throw new Error(`HTTP Error ! url="${response.url}", status="${response.status}"`);
            }
            return response.blob();
        }
    )
    .catch(
        error => console.error(error.message)
    );
};
